<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        return response()->json(Event::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'duracion' => 'required|string',
            'precio' => 'required|numeric|min:0',
        ]);

        $event = Event::create($validated);
        return response()->json($event, 201);
    }

    public function show(Event $event)
    {
        return response()->json($event);
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|required|string',
            'duracion' => 'sometimes|required|string',
            'precio' => 'sometimes|required|numeric|min:0',
        ]);

        $event->update($validated);
        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->noContent();
    }
}