<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $query = Item::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('sku', 'like', "%$search%");
            });
        }

        if ($request->has('low_stock')) {
            $query->whereRaw('stock_on_hand < reorder_level');
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string',
            'sku' => 'required|string|unique:items',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'reorder_level' => 'required|integer|min:0',
            'cost_price' => 'required|numeric',
            'sell_price' => 'required|numeric',
            'stock_on_hand' => 'nullable|integer',
        ]);

        $itemData = array_merge($validated, [
            'stock_on_hand' => $validated['stock_on_hand'] ?? 0,
            'average_cost' => $validated['cost_price'] ?? 0,
        ]);

        $item = Item::create($itemData);

        return response()->json($item, 201);
    }

    public function show($id)
    {
        $item = Item::findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string',
            'sku' => 'string|unique:items,sku,' . $id,
            'description' => 'nullable|string',
            'category' => 'string',
            'reorder_level' => 'integer|min:0',
            'cost_price' => 'numeric',
            'sell_price' => 'numeric',
            'stock_on_hand' => 'nullable|integer',
        ]);

        $item->update($validated);
        return response()->json($item);
    }

    public function destroy($id)
    {
        Item::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
