<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getByEvent($eventId)
    {
        // Paquetes generales
        $general = Package::where('isGeneral', true)
            ->with(['photos:photoId,packageIdFK,photoPath'])
            ->get([
                'packageId as id',
                'packageName',
                'packageDescription',
                'price as packagePrice',
            ]);

        // Paquetes específicos de este evento
        $specific = Package::where('isGeneral', false)
            ->where('eventIdFK', $eventId)
            ->with(['photos:photoId,packageIdFK,photoPath'])
            ->get([
                'packageId as id',
                'packageName',
                'packageDescription',
                'price as packagePrice',
            ]);

        if ($general->isEmpty() && $specific->isEmpty()) {
            return response()->json([
                'message' => 'No hay paquetes disponibles para este evento.',
                'general' => [],
                'specific' => [],
            ], 200);
        }

        return response()->json([
            'general' => $general,
            'specific' => $specific,
        ]);
        // $packages = Package::where('isGeneral', true)
        //     ->orWhere('eventIdFK', $eventId)
        //     ->with(['photos:photoId,packageIdFK,photoPath'])
        //     ->get([
        //         'packageId as id',
        //         'packageName',
        //         'packageDescription',
        //         'price as packagePrice'
        //     ]);

        // if ($packages->isEmpty()) {
        //     return response()->json([
        //         'message' => 'No hay paquetes disponibles para este evento.',
        //         'packages' => []
        //     ], 200);
        // }

        // return response()->json($packages);
    }

    public function index()
    {
        //
        return response()->json(Package::all());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Package $package)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Package $package)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Package $package)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Package $package)
    {
        //
    }
}
