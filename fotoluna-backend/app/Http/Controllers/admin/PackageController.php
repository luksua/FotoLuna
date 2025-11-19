<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        return response()->json(Package::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'cantidad_eventos' => 'required|integer|min:1',
            'precio' => 'required|numeric|min:0',
        ]);

        $package = Package::create($validated);
        return response()->json($package, 201);
    }

    public function show(Package $package)
    {
        return response()->json($package);
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|required|string',
            'cantidad_eventos' => 'sometimes|required|integer|min:1',
            'precio' => 'sometimes|required|numeric|min:0',
        ]);

        $package->update($validated);
        return response()->json($package);
    }

    public function destroy(Package $package)
    {
        $package->delete();
        return response()->noContent();
    }
}