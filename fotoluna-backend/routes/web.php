<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\ImageController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    if (! $request->hasValidSignature()) {
        abort(403, 'Firma inválida o expirada');
    }

    $user = \App\Models\User::findOrFail($id);
    if (! hash_equals((string) $hash, sha1($user->email))) {
        abort(403, 'Hash no coincide');
    }

    if (is_null($user->email_verified_at)) {
        $user->email_verified_at = now();
        $user->save();
    }

    // Redirige al frontend (configura FRONTEND_URL en .env)
    $frontend = env('FRONTEND_URL', 'http://localhost:5173');
    return redirect($frontend . '/email-verified?status=success');
})->name('verification.verify');

Route::get('/storage/{path}', [ImageController::class, 'show'])
    ->where('path', '.*');


// Route::get('/storage/{path}', function ($path) {
//     $file = Storage::disk('public')->get($path);
//     // Determine MIME type using finfo from the actual file path to avoid calling mimeType() on the Storage contract
//     $fullPath = Storage::disk('public')->path($path);
//     if (file_exists($fullPath)) {
//         $finfo = finfo_open(FILEINFO_MIME_TYPE);
//         $mime = $finfo ? finfo_file($finfo, $fullPath) : 'application/octet-stream';
//         if ($finfo) {
//             finfo_close($finfo);
//         }
//     } else {
//         $mime = 'application/octet-stream';
//     }
//     return Response::make($file, 200, [
//         'Content-Type' => $mime,
//         'Access-Control-Allow-Origin' => 'http://localhost:5173',
//         'Access-Control-Allow-Methods' => 'GET, OPTIONS',
//         'Access-Control-Allow-Headers' => 'Origin, Content-Type, Accept, Authorization',
//     ]);
// })->where('path', '.*');
