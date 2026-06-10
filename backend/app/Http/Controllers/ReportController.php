<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function dashboard()
    {
        $today = now()->startOfDay();
        $monthStart = now()->startOfMonth();

        $today_sales = Sale::where('sale_date', '>=', $today)->sum('total_amount');
        $today_purchases = Purchase::where('purchase_date', '>=', $today)->sum('total_amount');
        
        $month_sales = Sale::where('sale_date', '>=', $monthStart)->sum('total_amount');
        $month_purchases = Purchase::where('purchase_date', '>=', $monthStart)->sum('total_amount');
        $low_stock_count = Item::whereRaw('stock_on_hand <= reorder_level')->count();

        // Calculate total stock value
        $stock_value = Item::selectRaw('SUM(stock_on_hand * average_cost) as total_value')->value('total_value') ?? 0;

        // Build a CONTINUOUS daily sales series for the last 30 days. Days
        // with no sales are filled with 0 so the trend chart reads as one
        // unbroken line instead of a few disconnected dots.
        $rangeStart = now()->subDays(29)->startOfDay();
        $salesByDay = Sale::selectRaw('DATE(sale_date) as date, SUM(total_amount) as amount')
            ->where('sale_date', '>=', $rangeStart)
            ->groupBy('date')
            ->pluck('amount', 'date');

        $sales_chart = [];
        for ($i = 0; $i < 30; $i++) {
            $day = $rangeStart->copy()->addDays($i)->toDateString();
            $sales_chart[] = [
                'date' => $day,
                'amount' => (float) ($salesByDay[$day] ?? 0),
            ];
        }

        // Real trend percentages versus the previous comparable period.
        $yesterday_sales = Sale::whereBetween('sale_date', [
            now()->subDay()->startOfDay(),
            now()->subDay()->endOfDay(),
        ])->sum('total_amount');
        $today_trend = $yesterday_sales > 0
            ? round((($today_sales - $yesterday_sales) / $yesterday_sales) * 100, 1)
            : 0;

        $last_month_sales = Sale::whereBetween('sale_date', [
            now()->subMonthNoOverflow()->startOfMonth(),
            now()->subMonthNoOverflow()->endOfMonth(),
        ])->sum('total_amount');
        $month_trend = $last_month_sales > 0
            ? round((($month_sales - $last_month_sales) / $last_month_sales) * 100, 1)
            : 0;

        $top_items = SaleItem::selectRaw('items.name, SUM(sale_items.quantity) as quantity')
            ->join('items', 'items.id', '=', 'sale_items.item_id')
            ->groupBy('items.name', 'sale_items.item_id')
            ->orderByDesc('quantity')
            ->limit(5)
            ->get();

        $low_stock = Item::whereRaw('stock_on_hand <= reorder_level')
            ->select('id', 'name', 'stock_on_hand')
            ->get();

        return response()->json([
            'today' => [
                'sales' => (float) $today_sales,
                'purchases' => (float) $today_purchases,
                'profit' => (float) ($today_sales - $today_purchases),
                'stock_value' => (float) $stock_value,
                'sales_trend' => $today_trend,
            ],
            'month' => [
                'sales' => (float) $month_sales,
                'purchases' => (float) $month_purchases,
                'profit' => (float) ($month_sales - $month_purchases),
                'low_stock_count' => $low_stock_count,
                'sales_trend' => $month_trend,
            ],
            'sales_chart' => $sales_chart,
            'top_items' => $top_items,
            'low_stock_items' => $low_stock,
        ]);
    }

    public function itemSales(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'nullable|exists:items,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $query = SaleItem::selectRaw('DATE(sale_items.created_at) as date, SUM(sale_items.quantity) as total_quantity, SUM(sale_items.subtotal) as total_amount, sale_items.item_id, items.name as item_name')
            ->join('items', 'items.id', '=', 'sale_items.item_id');

        if ($validated['item_id'] ?? null) {
            $query->where('sale_items.item_id', $validated['item_id']);
        }

        if ($validated['start_date'] ?? null) {
            $query->whereDate('sale_items.created_at', '>=', $validated['start_date']);
        }

        if ($validated['end_date'] ?? null) {
            $query->whereDate('sale_items.created_at', '<=', $validated['end_date']);
        }

        $data = $query->groupBy('sale_items.item_id', DB::raw('DATE(sale_items.created_at)'), 'items.name')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    public function itemPurchases(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'nullable|exists:items,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $query = PurchaseItem::selectRaw('DATE(purchase_items.created_at) as date, SUM(purchase_items.quantity) as total_quantity, SUM(purchase_items.subtotal) as total_amount, purchase_items.item_id, items.name as item_name')
            ->join('items', 'items.id', '=', 'purchase_items.item_id');

        if ($validated['item_id'] ?? null) {
            $query->where('purchase_items.item_id', $validated['item_id']);
        }

        if ($validated['start_date'] ?? null) {
            $query->whereDate('purchase_items.created_at', '>=', $validated['start_date']);
        }

        if ($validated['end_date'] ?? null) {
            $query->whereDate('purchase_items.created_at', '<=', $validated['end_date']);
        }

        $data = $query->groupBy('purchase_items.item_id', DB::raw('DATE(purchase_items.created_at)'), 'items.name')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    public function profitLoss(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $start = $validated['start_date'] ?? now()->subMonths(12)->toDateString();
        $end = $validated['end_date'] ?? now()->toDateString();

        $sales_revenue = Sale::whereBetween('sale_date', [$start, $end])->sum('total_amount');
        
        $purchase_cost = Purchase::whereBetween('purchase_date', [$start, $end])
            ->join('purchase_items', 'purchases.id', '=', 'purchase_items.purchase_id')
            ->sum('purchase_items.subtotal');

        $profit = $sales_revenue - $purchase_cost;
        $margin = $sales_revenue > 0 ? ($profit / $sales_revenue) * 100 : 0;

        return response()->json([
            'revenue' => $sales_revenue,
            'cost_of_goods_sold' => $purchase_cost,
            'profit' => $profit,
            'profit_margin_percent' => round($margin, 2),
            'period' => ['start' => $start, 'end' => $end],
        ]);
    }

    public function stock()
    {
        $items = Item::all(['id', 'name', 'sku', 'stock_on_hand', 'average_cost', 'reorder_level']);

        $items->each(function ($item) {
            $item->inventory_value = $item->stock_on_hand * $item->average_cost;
            $item->status = $item->stock_on_hand <= $item->reorder_level ? 'low' : 'ok';
        });

        $total_value = $items->sum('inventory_value');

        return response()->json([
            'items' => $items,
            'total_inventory_value' => $total_value,
            'summary' => [
                'total_items' => $items->count(),
                'low_stock_count' => $items->where('status', 'low')->count(),
            ],
        ]);
    }

    public function salesByDate(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $start = $validated['start_date'] ?? now()->subDays(30)->toDateString();
        $end = $validated['end_date'] ?? now()->toDateString();

        $data = Sale::selectRaw('DATE(sale_date) as date, COUNT(*) as count, SUM(total_amount) as total')
            ->whereBetween('sale_date', [$start, $end])
            ->groupBy('sale_date')
            ->orderBy('sale_date')
            ->get();

        return response()->json($data);
    }
}
