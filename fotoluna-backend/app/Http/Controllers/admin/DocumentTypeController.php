<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use Illuminate\Http\Request;

class DocumentTypeController extends Controller
{
    public function index()
    {
        return response()->json(DocumentType::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'cantidad' => 'required|integer|min:1',
            'precio' => 'required|numeric|min:0',
        ]);

        $documentType = DocumentType::create($validated);
        return response()->json($documentType, 201);
    }

    public function show(DocumentType $documentType)
    {
        return response()->json($documentType);
    }

    public function update(Request $request, DocumentType $documentType)
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|required|string',
            'cantidad' => 'sometimes|required|integer|min:1',
            'precio' => 'sometimes|required|numeric|min:0',
        ]);

        $documentType->update($validated);
        return response()->json($documentType);
    }

    public function destroy(DocumentType $documentType)
    {
        $documentType->delete();
        return response()->noContent();
    }
}