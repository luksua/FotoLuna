<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/customer', [ProfileController::class, 'update']);
    Route::post('/customer/password', [ProfileController::class, 'updatePassword']);
});

Route::post('/email/resend', [AuthController::class, 'resendVerification']);