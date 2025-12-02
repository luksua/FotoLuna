<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactMessageReceived;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'firstName' => ['required', 'string', 'max:255'],
            'lastName'  => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255'],
            'phone'     => ['nullable', 'string', 'max:50'],
            'select'    => ['nullable', 'string', 'max:50'],
            'message'   => ['required', 'string'],
        ]);

        $contact = ContactMessage::create([
            'first_name'   => $validated['firstName'],
            'last_name'    => $validated['lastName'],
            'email'        => $validated['email'],
            'phone'        => $validated['phone'] ?? null,
            'subject_type' => $validated['select'] ?? null,
            'message'      => $validated['message'],
        ]);

        Mail::to('info@fotoluna.com')->send(new ContactMessageReceived($validated));

        return response()->json([
            'ok' => true,
            'message' => 'Mensaje enviado correctamente.',
            'data' => $contact,
        ], 201);
    }
}