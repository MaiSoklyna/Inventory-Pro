<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Item;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all(['key', 'value', 'type']);
        $out = [];
        foreach ($settings as $setting) {
            $out[$setting->key] = $this->castValue($setting->value, $setting->type);
        }
        return response()->json((object) $out);
    }

    /**
     * Cast a stored string value back to its declared type so the
     * frontend receives real booleans/numbers (e.g. the email
     * notifications checkbox) instead of strings like "false".
     */
    private function castValue($value, $type)
    {
        if ($value === null) {
            return null;
        }
        switch ($type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'number':
                return $value + 0;
            case 'json':
                return json_decode($value, true);
            default:
                return $value;
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|unique:settings',
            'value' => 'nullable',
            'type' => 'in:string,boolean,number,json',
            'description' => 'nullable|string',
        ]);

        $setting = Setting::create($validated);
        return response()->json($setting, 201);
    }

    public function show($key)
    {
        $setting = Setting::where('key', $key)->firstOrFail();
        return response()->json($setting);
    }

    public function update(Request $request, $key)
    {
        $setting = Setting::where('key', $key)->firstOrFail();

        $validated = $request->validate([
            'value' => 'nullable',
            'description' => 'nullable|string',
        ]);

        $setting->update($validated);
        return response()->json($setting);
    }

    public function bulkUpdate(Request $request)
    {
        $data = $request->all();
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $type = 'json';
                $stored = json_encode($value);
            } elseif (is_bool($value)) {
                $type = 'boolean';
                $stored = $value ? 'true' : 'false';
            } elseif (is_int($value) || is_float($value)) {
                $type = 'number';
                $stored = (string) $value;
            } else {
                $type = 'string';
                $stored = $value;
            }
            Setting::updateOrCreate(['key' => $key], ['value' => $stored, 'type' => $type]);
        }
        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Danger zone: wipe all transactional data (sales, purchases, their
     * line items, items and contacts). Users and settings are preserved
     * so the admin can still log in afterwards.
     */
    public function reset(Request $request)
    {
        DB::transaction(function () {
            SaleItem::query()->delete();
            PurchaseItem::query()->delete();
            Sale::query()->delete();
            Purchase::query()->delete();
            Item::query()->delete();
            Contact::query()->delete();
        });

        return response()->json(['message' => 'Data reset successfully']);
    }
}
