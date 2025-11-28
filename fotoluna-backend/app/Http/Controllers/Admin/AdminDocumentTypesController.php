<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use Illuminate\Http\Response;
use Illuminate\Http\Request;

class AdminDocumentTypesController extends Controller
{
    /**
     * Get all document types
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $documentTypes = DocumentType::all();

            return response()->json(
                $documentTypes->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'nombre' => $doc->name ?? 'Sin nombre',
                        'descripcion' => $doc->description ?? '',
                        'cantidad' => $doc->number_photos ?? $doc->number ?? 1,
                        'precio' => $doc->price ?? 0,
                        'requiereSubida' => (bool) ($doc->requiresUpload ?? false),
                        'requierePresencial' => (bool) ($doc->requiresPresence ?? false),
                        'estado' => (bool) ($doc->state ?? true),
                    ];
                }),
                Response::HTTP_OK
            );
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new document type
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'descripcion' => 'required|string|max:1000',
                'cantidad' => 'required|integer|min:1',
                'precio' => 'required|numeric|min:0',
                'requiereSubida' => 'nullable|boolean',
                'requierePresencial' => 'nullable|boolean',
            ]);

            // Solo una de las dos puede ser true
            $requiereSubida = $validated['requiereSubida'] ?? false;
            $requierePresencial = $validated['requierePresencial'] ?? false;

            $doc = DocumentType::create([
                'name' => $validated['nombre'],
                'description' => $validated['descripcion'],
                'number_photos' => $validated['cantidad'],
                'price' => $validated['precio'],
                'requiresUpload' => $requiereSubida,
                'requiresPresence' => $requierePresencial,
                'state' => true,
            ]);

            return response()->json([
                'id' => $doc->id,
                'nombre' => $doc->name,
                'descripcion' => $doc->description,
                'cantidad' => $doc->number_photos,
                'precio' => $doc->price,
                'requiereSubida' => (bool) $doc->requiresUpload,
                'requierePresencial' => (bool) $doc->requiresPresence,
                'estado' => (bool) $doc->state,
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update a document type
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $doc = DocumentType::find($id);

            if (!$doc) {
                return response()->json(['error' => 'Documento no encontrado'], Response::HTTP_NOT_FOUND);
            }

            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'descripcion' => 'required|string|max:1000',
                'cantidad' => 'required|integer|min:1',
                'precio' => 'required|numeric|min:0',
                'requiereSubida' => 'nullable|boolean',
                'requierePresencial' => 'nullable|boolean',
            ]);

            $requiereSubida = $validated['requiereSubida'] ?? false;
            $requierePresencial = $validated['requierePresencial'] ?? false;

            $doc->update([
                'name' => $validated['nombre'],
                'description' => $validated['descripcion'],
                'number_photos' => $validated['cantidad'],
                'price' => $validated['precio'],
                'requiresUpload' => $requiereSubida,
                'requiresPresence' => $requierePresencial,
            ]);

            return response()->json([
                'id' => $doc->id,
                'nombre' => $doc->name,
                'descripcion' => $doc->description,
                'cantidad' => $doc->number_photos,
                'precio' => $doc->price,
                'requiereSubida' => (bool) $doc->requiresUpload,
                'requierePresencial' => (bool) $doc->requiresPresence,
                'estado' => (bool) $doc->state,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update document type status
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $doc = DocumentType::find($id);

            if (!$doc) {
                return response()->json(['error' => 'Documento no encontrado'], Response::HTTP_NOT_FOUND);
            }

            $validated = $request->validate([
                'estado' => 'required|boolean',
            ]);

            $doc->update(['state' => $validated['estado']]);

            return response()->json([
                'id' => $doc->id,
                'estado' => (bool) $doc->state,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

