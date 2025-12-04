<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Response;
use Illuminate\Http\Request;

class AdminEventsController extends Controller
{
    /**
     * Get all events
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $events = Event::all();

            return response()->json(
                $events->map(function ($event) {
                    return [
                        'id' => $event->eventId ?? $event->id,
                        'nombre' => $event->eventType ?? 'Sin nombre',
                        'descripcion' => $event->category ?? '',
                        'duracion' => '-',
                        'precio' => 0,
                        'estado' => (bool) $event->state,
                    ];
                }),
                Response::HTTP_OK
            );
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new event
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'descripcion' => 'required|string|max:255',
            ]);

            $event = Event::create([
                'eventType' => $validated['nombre'],
                'category' => $validated['descripcion'],
                'state' => true,
            ]);

            return response()->json([
                'id' => $event->eventId,
                'nombre' => $event->eventType,
                'descripcion' => $event->category,
                'estado' => (bool) $event->state,
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update an event
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $event = Event::find($id);

            if (!$event) {
                return response()->json(['error' => 'Evento no encontrado'], Response::HTTP_NOT_FOUND);
            }

            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'descripcion' => 'required|string|max:255',
            ]);

            $event->update([
                'eventType' => $validated['nombre'],
                'category' => $validated['descripcion'],
            ]);

            return response()->json([
                'id' => $event->eventId,
                'nombre' => $event->eventType,
                'descripcion' => $event->category,
                'estado' => (bool) $event->state,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update event status
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $event = Event::find($id);

            if (!$event) {
                return response()->json(['error' => 'Evento no encontrado'], Response::HTTP_NOT_FOUND);
            }

            $validated = $request->validate([
                'estado' => 'required|boolean',
            ]);

            $event->update([
                'state' => $validated['estado'],
            ]);

            return response()->json([
                'id' => $event->eventId,
                'nombre' => $event->eventType,
                'descripcion' => $event->category,
                'estado' => (bool) $event->state,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
