<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;

class ImageController extends Controller
{
    public function show($path)
    {
        $fullPath = Storage::disk('public')->path($path);

        if (!File::exists($fullPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        $mime = mime_content_type($fullPath);
        $file = File::get($fullPath);

        return response($file, 200)
            ->header('Content-Type', $mime)
            ->header('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}
