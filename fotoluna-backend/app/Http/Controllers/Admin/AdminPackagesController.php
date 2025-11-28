<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Event;
use Illuminate\Http\Response;
use Illuminate\Http\Request;

class AdminPackagesController extends Controller
{
    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $packages = Package::all();

            return response()->json(
                $packages->map(function ($package) {

                    $event = Event::where('eventId', $package->eventIdFK)->first();

                    return [
                        'id' => $package->packageId ?? $package->id,
                        'nombre' => $package->packageName ?? 'Sin nombre',
                        'descripcion' => $package->packageDescription ?? '',
                        'cantidad_eventos' => 1,
                        'precio' => $package->price ?? 0,
                        'evento_nombre' => $event ? ($event->eventType ?? 'Sin evento') : 'Sin evento',
                        'estado' => $package->state ?? true,
                    ];
                }),
                Response::HTTP_OK
            );
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new package
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'descripcion' => 'required|string|max:1000',
                'precio' => 'required|numeric',
                'eventId' => 'nullable|integer',
                'isGeneral' => 'nullable|boolean',
            ]);

            $pkg = Package::create([
                'packageName' => $validated['nombre'],
                'packageDescription' => $validated['descripcion'],
                'price' => $validated['precio'],
                'eventIdFK' => $validated['eventId'] ?? null,
                'isGeneral' => $validated['isGeneral'] ?? false,
                'state' => true,
            ]);

            return response()->json([
                'id' => $pkg->packageId,
                'nombre' => $pkg->packageName,
                'descripcion' => $pkg->packageDescription,
                'precio' => $pkg->price,
                'evento_nombre' => $pkg->event ? ($pkg->event->eventType ?? 'Sin evento') : 'Sin evento',
                'estado' => (bool) $pkg->state,
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update a package
     */
    public function update(Request $request, $id)
    {
        try {
            $pkg = Package::find($id);

            if (!$pkg) {
                return response()->json(['error' => 'Paquete no encontrado'], Response::HTTP_NOT_FOUND);
            }

            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'descripcion' => 'required|string|max:1000',
                'precio' => 'required|numeric',
                'eventId' => 'nullable|integer',
                'isGeneral' => 'nullable|boolean',
            ]);

            $pkg->update([
                'packageName' => $validated['nombre'],
                'packageDescription' => $validated['descripcion'],
                'price' => $validated['precio'],
                'eventIdFK' => $validated['eventId'] ?? $pkg->eventIdFK,
                'isGeneral' => $validated['isGeneral'] ?? $pkg->isGeneral,
            ]);

            return response()->json([
                'id' => $pkg->packageId,
                'nombre' => $pkg->packageName,
                'descripcion' => $pkg->packageDescription,
                'precio' => $pkg->price,
                'evento_nombre' => $pkg->event ? ($pkg->event->eventType ?? 'Sin evento') : 'Sin evento',
                'estado' => (bool) $pkg->state,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update package status (enable/disable)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $pkg = Package::find($id);

            if (!$pkg) {
                return response()->json(['error' => 'Paquete no encontrado'], Response::HTTP_NOT_FOUND);
            }

            $validated = $request->validate([
                'estado' => 'required|boolean',
            ]);

            $pkg->update(['state' => $validated['estado']]);

            return response()->json([
                'id' => $pkg->packageId,
                'estado' => (bool) $pkg->state,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
