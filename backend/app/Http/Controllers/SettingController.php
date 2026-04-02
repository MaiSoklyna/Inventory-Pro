<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all();
        return response()->json($settings);
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
}
