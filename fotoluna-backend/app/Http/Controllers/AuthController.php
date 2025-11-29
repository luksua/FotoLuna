<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Customer;
use App\Models\StorageSubscription;
use Carbon\Carbon;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();
        $role = $data['role'] ?? 'cliente';

        DB::beginTransaction();
        try {
            // Crear usuario
            $user = User::create([
                'name' => $data['name'] ?? ($data['firstNameCustomer'] ?? $data['firstNameEmployee'] ?? 'Sin nombre'),
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $role,
            ]);

            // --- Manejo de la imagen: si llega file lo guardamos, si no usamos la cadena o ''
            $photoCustomerPath = '';
            $photoEmployeePath = '';

            // Si el request es multipart y tiene archivo
            if ($request->hasFile('photoCustomer') && $request->file('photoCustomer')->isValid()) {
                $photoCustomerPath = $request->file('photoCustomer')->store('customers', 'public');
            } else {
                // Si en JSON mandaron la ruta/base64 u otro valor en validated
                $photoCustomerPath = $data['photoCustomer'] ?? '';
            }

            if ($request->hasFile('photoEmployee') && $request->file('photoEmployee')->isValid()) {
                $photoEmployeePath = $request->file('photoEmployee')->store('employees', 'public');
            } else {
                $photoEmployeePath = $data['photoEmployee'] ?? '';
            }

            // Crear la fila domain y asociar user_id
            if ($role === 'cliente') {
                Customer::create([
                    'user_id' => $user->id,
                    'firstNameCustomer' => $data['firstNameCustomer'] ?? ($data['name'] ?? ''),
                    'lastNameCustomer' => $data['lastNameCustomer'] ?? '',
                    'photoCustomer' => $photoCustomerPath ?: '',
                    'emailCustomer' => $data['email'],
                    // Si aún necesitas mantener password en customers por compatibilidad:
                    'password' => $user->password,
                    'phoneCustomer' => $data['phoneCustomer'] ?? '',
                    'documentType' => $data['documentType'] ?? 'CC',
                    'documentNumber' => $data['documentNumber'] ?? '',
                    'created_by_user_id' => $request->input('created_by_user_id'),

                ]);
            }

            if ($role === 'empleado') {
                Employee::create([
                    'user_id' => $user->id,
                    'firstNameEmployee' => $data['firstNameEmployee'] ?? ($data['name'] ?? ''),
                    'lastNameEmployee' => $data['lastNameEmployee'] ?? '',
                    'phoneEmployee' => $data['phoneEmployee'] ?? '',
                    'photoEmployee' => $photoEmployeePath ?: '',
                    'address' => $data['address'] ?? '',
                    'documentType' => $data['documentTypeEmployee'] ?? 'CC',
                    'documentNumber' => $data['documentNumberEmployee'] ?? '',
                    'emailEmployee' => $data['email'],
                    'password' => $user->password,
                    'employeeType' => $data['employeeType'] ?? 'Employee',
                    'gender' => $data['gender'] ?? 'Other',
                    'EPS' => $data['EPS'] ?? '',
                ]);
            }

            DB::commit();

            $token = $user->createToken('auth_token')->plainTextToken;

            // Enviar la notificación de verificación por correo
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Throwable $e) {
                \Log::warning('No se pudo enviar email de verificación: ' . $e->getMessage());
            }

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
                'message' => 'Usuario registrado. Se envió un correo de verificación.'
            ], Response::HTTP_CREATED);
        } catch (\Throwable $e) {
            DB::rollBack();
            // Loguea el error en el log de Laravel si quieres más detalle
            \Log::error('Register failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Error al registrar usuario',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // Login: valida y devuelve token
    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Correo o contraseña inválidos'], Response::HTTP_UNAUTHORIZED);
        }

        // (Opcional) Validar correo verificado
        // if (!$user->hasVerifiedEmail()) {
        //     return response()->json(['message' => 'Debe verificar su correo antes de iniciar sesión.'], Response::HTTP_FORBIDDEN);
        // }

        // Crear token con rol como ability
        $token = $user->createToken('auth_token', [$user->role])->plainTextToken;

        // Construir respuesta base
        $response = [
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
            'role' => $user->role,
        ];

        // Agregar ruta de redirección según rol
        switch ($user->role) {
            case 'admin':
                $response['redirect_to'] = '/admin';
                break;

            case 'empleado':
                $response['redirect_to'] = '/empleado';
                break;

            case 'cliente':
            default:
                $response['redirect_to'] = '/';
                break;
        }

        return response()->json($response, Response::HTTP_OK);
    }

    // public function login(LoginRequest $request)
    // {
    //     $data = $request->validated();

    //     $user = User::where('email', $data['email'])->first();

    //     if (!$user || !Hash::check($data['password'], $user->password)) {
    //         return response()->json(['message' => 'Correo o contraseña invalidos'], Response::HTTP_UNAUTHORIZED);
    //     }

    //     $token = $user->createToken('auth_token', [$user->role])->plainTextToken;

    //     $response = [
    //         'access_token' => $token,
    //         'token_type' => 'Bearer',
    //         'role' => $user->role,
    //         'user' => $user,
    //     ];

    //     // Retornar respuesta diferente según rol
    //     switch ($user->role) {
    //         case 'admin':
    //             $response['redirect_to'] = '/admin';
    //             break;
    //         case 'empleado':
    //             $response['redirect_to'] = '/empleado';
    //             break;
    //         case 'cliente':
    //         default:
    //             $response['redirect_to'] = '/';
    //             break;
    //     }

    //     return response()->json($response, Response::HTTP_OK);
    // }

    // Logout: elimina el token actual (logout desde un dispositivo)
    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Usuario no autenticado'], 200);
        }

        $token = $user->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json(['message' => 'Sesión cerrada'], 200);
    }


    // Logout all: opcional, elimina todos los tokens del usuario (cerrar sesión en todos los dispositivos)
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Todas las sesiones cerradas'], Response::HTTP_OK);
    }

    // Obtener usuario autenticado
    public function me(Request $request)
    {
        $user = $request->user()->load(['customer', 'employee']);

        // --- 1) Foto y nombres como ya lo tienes ---
        $photo = optional($user->customer)->photoCustomer
            ?? optional($user->employee)->photoEmployee
            ?? $user->avatar ?? null;

        $firstName = optional($user->customer)->firstNameCustomer
            ?? optional($user->employee)->firstNameEmployee
            ?? $user->name;

        $lastName = optional($user->customer)->lastNameCustomer
            ?? optional($user->employee)->lastNameEmployee
            ?? null;

        if ($photo && !Str::startsWith($photo, ['http://', 'https://', 'data:'])) {
            $photo = url("storage/{$photo}");
        }

        // --- 2) Calcular si tiene suscripción de almacenamiento activa ---
        $hasStorageSubscription = false;

        if ($user->customer) {
            $hasStorageSubscription = StorageSubscription::where('customerIdFK', $user->customer->customerId)
                ->where('status', '!=', 'expired')                  // cualquier estado que no sea expirado
                ->whereDate('ends_at', '>=', Carbon::today())
                ->exists();
        }

        // --- 3) Devolver todo en el JSON ---
        return response()->json(array_merge($user->toArray(), [
            'photo' => $photo,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'has_storage_subscription' => $hasStorageSubscription,
        ]));
    }

    public function resendVerification(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Correo ya verificado.'], 200);
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            \Log::error('Error re-enviando verificación: ' . $e->getMessage());
            return response()->json(['message' => 'No se pudo enviar el correo de verificación.'], 500);
        }

        return response()->json(['message' => 'Correo de verificación reenviado.'], 200);
    }
}