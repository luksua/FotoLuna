<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  mixed ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Si no está logueado, 401
        if (!auth()->check()) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $user = auth()->user();

        // Si su rol NO está en la lista de roles permitidos, 403
        if (! in_array($user->role, $roles)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return $next($request);
    }
}
