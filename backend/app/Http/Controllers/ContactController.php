<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:contacts',
            'phone' => 'required|string',
            'address' => 'nullable|string',
            'note' => 'nullable|string',
            'type' => 'required|in:customer,supplier',
        ]);

        $contact = Contact::create($validated);
        return response()->json($contact, 201);
    }

    public function show($id)
    {
        $contact = Contact::findOrFail($id);
        return response()->json($contact);
    }

    public function update(Request $request, $id)
    {
        $contact = Contact::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string',
            'email' => 'email|unique:contacts,email,' . $id,
            'phone' => 'string',
            'address' => 'nullable|string',
            'note' => 'nullable|string',
            'type' => 'in:customer,supplier',
            'active' => 'boolean',
        ]);

        $contact->update($validated);
        return response()->json($contact);
    }

    public function destroy($id)
    {
        Contact::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
