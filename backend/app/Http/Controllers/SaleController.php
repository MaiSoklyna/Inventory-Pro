<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Item;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['contact', 'items']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('contact', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'sale_date' => 'required|date',
            'due_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'note' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            $blockNegativeStock = Setting::where('key', 'block_negative_stock')->value('value') === 'true';

            // Check stock availability first
            foreach ($validated['items'] as $item) {
                $itemRecord = Item::find($item['item_id']);
                if ($blockNegativeStock && $itemRecord->stock_on_hand < $item['quantity']) {
                    return response()->json([
                        'message' => 'Insufficient stock: ' . $itemRecord->name,
                        'item' => $itemRecord->name,
                        'requested' => $item['quantity'],
                        'available' => $itemRecord->stock_on_hand,
                    ], 422);
                }
            }

            $sale = Sale::create([
                'sale_number' => 'SAL-' . date('YmdHis'),
                'contact_id' => $validated['contact_id'],
                'sale_date' => $validated['sale_date'],
                'due_date' => $validated['due_date'],
                'total_amount' => 0,
                'paid_amount' => 0,
                'status' => 'pending',
                'payment_status' => 'pending',
                'note' => $validated['note'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $subtotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $subtotal;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'item_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $subtotal,
                ]);

                // Update item stock
                $itemRecord = Item::find($item['item_id']);
                $itemRecord->stock_on_hand -= $item['quantity'];
                $itemRecord->save();
            }

            $sale->total_amount = $totalAmount;
            $sale->save();

            return response()->json($sale->load('items'), 201);
        });
    }

    public function show($id)
    {
        $sale = Sale::with(['contact', 'items'])->findOrFail($id);
        return response()->json($sale);
    }

    public function update(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);

        $validated = $request->validate([
            'status' => 'in:pending,completed,cancelled',
            'payment_status' => 'in:pending,partial,paid',
            'paid_amount' => 'nullable|numeric|min:0',
            'note' => 'nullable|string',
        ]);

        $sale->update($validated);
        return response()->json($sale);
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $sale = Sale::find($id);

            foreach ($sale->items as $item) {
                $itemRecord = Item::find($item->item_id);
                $itemRecord->stock_on_hand += $item->quantity;
                $itemRecord->save();
            }

            $sale->delete();
            return response()->json(['message' => 'Deleted successfully']);
        });
    }
}
