<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;
use App\Notifications\EmployeeReceivedReview;

class CommentsController extends Controller
{
    /**
     * Obtener todos los comentarios (sin filtro de evento)
     */
    public function index(): JsonResponse
    {
        try {
            $comments = Comment::with(['user', 'user.employee', 'user.customer', 'photographer'])
                ->orderBy('created_at', 'desc')
                ->paginate(10); // 10 comentarios por página

            // Formatear respuesta para no mostrar datos del usuario si es anónimo
            $formattedComments = $comments->map(function ($comment) {
                // Obtener avatar del usuario o del empleado/cliente asociado
                $userAvatar = null;
                if ($comment->user) {
                    // Primero intentar obtener avatar de users.avatar
                    if ($comment->user->avatar) {
                        $userAvatar = Storage::url($comment->user->avatar);
                    }
                    // Si no, buscar en employee.photoEmployee
                    elseif ($comment->user->employee && $comment->user->employee->photoEmployee) {
                        $userAvatar = Storage::url($comment->user->employee->photoEmployee);
                    }
                    // Si no, buscar en customer.photoCustomer
                    elseif ($comment->user->customer && $comment->user->customer->photoCustomer) {
                        $userAvatar = Storage::url($comment->user->customer->photoCustomer);
                    }
                }

                return [
                    'id' => $comment->id,
                    'rating' => $comment->rating,
                    'comment_text' => $comment->comment_text,
                    'photo_path' => $comment->photo_path ? Storage::url($comment->photo_path) : null,
                    'is_anonymous' => $comment->is_anonymous,
                    'user_name' => $comment->is_anonymous ? 'Anónimo' : ($comment->user->name ?? 'Usuario'),
                    'user_avatar' => $comment->is_anonymous ? null : $userAvatar,
                    'photographer_name' => $comment->photographer ? $comment->photographer->name ?? ($comment->photographer->firstNameEmployee ?? null) : null,
                    'created_at' => $comment->created_at->format('d/m/Y H:i'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedComments,
                'pagination' => [
                    'total' => $comments->total(),
                    'per_page' => $comments->perPage(),
                    'current_page' => $comments->currentPage(),
                    'last_page' => $comments->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener comentarios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo comentario (sin evento o evento opcional)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'comment_text' => 'required|string|max:500',
                'rating' => 'required|integer|between:1,5',
                'is_anonymous' => 'nullable|boolean',
                'photo' => 'nullable|image|max:2048', // máximo 2MB
                'photographer_id' => 'nullable|exists:users,id',
            ]);

            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Procesar foto si existe
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('comments', 'public');
            }

            // Crear comentario (comentario general)
            $comment = Comment::create([
                'user_id' => $user->id,
                'photographer_id' => $validated['photographer_id'] ?? null,
                'rating' => $validated['rating'],
                'comment_text' => $validated['comment_text'],
                'photo_path' => $photoPath,
                'is_anonymous' => $validated['is_anonymous'] ?? false,
            ]);

            // Cargar relación del usuario y fotógrafo
            $comment->load(['user', 'user.employee', 'user.customer', 'photographer']);

            // 🔔 NOTIFICACIÓN AL FOTÓGRAFO (si se especificó uno)
            if ($comment->photographer) {
                $comment->photographer->notify(
                    new EmployeeReceivedReview($comment)
                );
            }

            // Buscar avatar en múltiples ubicaciones
            $userAvatar = null;
            if ($comment->user) {
                if ($comment->user->avatar) {
                    $userAvatar = Storage::url($comment->user->avatar);
                } elseif ($comment->user->employee && $comment->user->employee->photoEmployee) {
                    $userAvatar = Storage::url($comment->user->employee->photoEmployee);
                } elseif ($comment->user->customer && $comment->user->customer->photoCustomer) {
                    $userAvatar = Storage::url($comment->user->customer->photoCustomer);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Comentario creado correctamente',
                'data' => [
                    'id' => $comment->id,
                    'rating' => $comment->rating,
                    'comment_text' => $comment->comment_text,
                    'photo_path' => $comment->photo_path ? Storage::url($comment->photo_path) : null,
                    'is_anonymous' => $comment->is_anonymous,
                    'user_name' => $comment->is_anonymous ? 'Anónimo' : $comment->user->name,
                    'user_avatar' => $comment->is_anonymous ? null : $userAvatar,
                    'photographer_name' => $comment->photographer ? $comment->photographer->name ?? ($comment->photographer->firstNameEmployee ?? null) : null,
                    'created_at' => $comment->created_at->format('d/m/Y H:i'),
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear comentario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de puntuaciones (para dashboard admin)
     */
    public function ratings(): JsonResponse
    {
        try {
            // Agrupar comentarios por rating y contar
            $ratingsData = Comment::selectRaw('rating, COUNT(*) as cantidad')
                ->groupBy('rating')
                ->orderBy('rating', 'asc')
                ->get();

            // Crear array con todas las puntuaciones (1-5)
            $allRatings = [];
            for ($i = 1; $i <= 5; $i++) {
                $found = $ratingsData->firstWhere('rating', $i);
                $allRatings[] = [
                    'estrellas' => $i,
                    'cantidad' => $found ? $found->cantidad : 0,
                ];
            }

            // Calcular promedio
            $totalComments = Comment::count();
            $averageRating = $totalComments > 0 ? Comment::avg('rating') : 0;

            return response()->json([
                'success' => true,
                'data' => $allRatings,
                'total' => $totalComments,
                'average' => round($averageRating, 2),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un comentario (solo el propietario o admin)
     */
    public function destroy(Comment $comment, Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Verificar que el usuario sea el propietario o admin
            if ($comment->user_id !== $user->id && $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para eliminar este comentario'
                ], 403);
            }

            // Eliminar foto si existe
            if ($comment->photo_path) {
                Storage::disk('public')->delete($comment->photo_path);
            }

            $comment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Comentario eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar comentario: ' . $e->getMessage()
            ], 500);
        }
    }
}
