<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Carga manual de las rutas de la API
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        // Carga manual de las rutas Web (si es necesario)
        Route::middleware('web')
            ->group(base_path('routes/web.php'));

        // ... (deja el resto del código que ya estaba)
    }
}
