<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException; 
use Illuminate\Http\Request; 
use App\Http\Middleware\Authenticate; // 👈 1. Importar tu Middleware creado

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php', // 👈 2. AÑADIDO: Carga del archivo routes/api.php
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        
        // 👈 3. AÑADIDO: Mapear el alias 'auth' a tu clase Authenticate.php
        $middleware->alias([
            'auth' => Authenticate::class,
        ]);
        
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        
        // Esta lógica ya la tenías, ahora funcionará correctamente.
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.' 
                ], 401);
            }
            
            return null;
        });
        
    })->create();