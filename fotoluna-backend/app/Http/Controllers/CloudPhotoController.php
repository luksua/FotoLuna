<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CloudPhoto;
use Illuminate\Support\Facades\Storage;


class CloudPhotoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    // Subida de varias fotos al storage de Contabo
    public function store(Request $request)
{
    // 1) Validar lo que viene del front (Upload.tsx)
    $request->validate([
        'photos.*'                => ['required', 'image', 'max:5120'],
        'event_name'              => ['required', 'string'],
        'date'                    => ['required', 'date'],
        'time'                    => ['required'],
        'location'                => ['required', 'string'],
        'linked_users'            => ['nullable', 'string'],

        // campos para la FK
        'customerIdFK'            => ['required', 'integer', 'exists:customers,customerId'],
        'bookingIdFK'             => ['nullable', 'integer', 'exists:bookings,bookingId'],
        'storage_subscription_id' => ['nullable', 'integer'],
    ]);

    if (!$request->hasFile('photos')) {
        return response()->json([
            'message' => 'No se recibieron archivos.',
        ], 422);
    }

    $uploaded = [];

    foreach ($request->file('photos') as $photo) {
        // 2) Subir a S3
        $path = $photo->store('cloud_photos', 's3');
        Storage::disk('s3')->setVisibility($path, 'public');

        // 3) Guardar en BD
        $cloudPhoto = CloudPhoto::create([
            'customerIdFK'            => $request->customerIdFK,
            'bookingIdFK'             => $request->bookingIdFK,
            'storage_subscription_id' => $request->storage_subscription_id,
            'path'                    => $path,
            'thumbnail_path'          => null, // por ahora
            'original_name'           => $photo->getClientOriginalName(),
            'size'                    => $photo->getSize(),
        ]);

        // 4) Armar respuesta (con URL pública)
        $uploaded[] = [
            'id'            => $cloudPhoto->id,
            'customerIdFK'  => $cloudPhoto->customerIdFK,
            'bookingIdFK'   => $cloudPhoto->bookingIdFK,
            'path'          => $cloudPhoto->path,
            'url'           => Storage::disk('s3')->url($cloudPhoto->path),
            'original_name' => $cloudPhoto->original_name,
            'size'          => $cloudPhoto->size,
            'created_at'    => $cloudPhoto->created_at,
        ];
    }

    return response()->json([
        'message' => 'Fotos subidas y guardadas correctamente.',
        'photos'  => $uploaded,
    ], 201);
}


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
