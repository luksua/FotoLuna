<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 👇 intercepta las respuestas de autenticación fallida
        $middleware->redirectGuestsTo(function ($request) {
            // Si es una petición API, no redirige — devuelve JSON 401
            if ($request->expectsJson()) {
                return null;
            }

            // Solo las vistas web usan la ruta 'login'
            return route('login');
        });

        // Alias de middlewares de ruta
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            // aquí podrías agregar más, si quieres
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
