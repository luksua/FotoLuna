<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RegisterEmployeeController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate(
                [
                    'firstNameEmployee' => 'required|string|max:255',
                    'lastNameEmployee' => 'required|string|max:255',
                    'phoneEmployee' => 'required|string|max:255',
                    'EPS' => 'required|string|max:255',
                    'documentType' => 'required|in:CC,CE,PAS',
                    'documentNumber' => 'required|string|max:255|unique:employees,documentNumber',
                    'emailEmployee' => 'required|email|max:255|unique:employees,emailEmployee|unique:users,email',
                    'address' => 'required|string|max:255',
                    'password' => 'required|string|min:6|confirmed',
                    'employeeType' => 'required|in:Employee,Admin',
                    'gender' => 'required|in:Female,Male,Other',
                    'photoEmployee' => 'nullable|image|max:2048',
                    'specialty' => 'nullable|string|max:255',
                    'isAvailable' => 'nullable|boolean',
                ],
                [
                    'documentNumber.unique' => 'Ya hay un usuario registrado con ese número de documento.',
                    'emailEmployee.unique' => 'Ya hay un usuario registrado con ese correo electrónico.',
                    'documentNumber.required' => 'El número de documento es requerido.',
                    'emailEmployee.required' => 'El correo electrónico es requerido.',
                    'emailEmployee.email' => 'El correo electrónico debe ser válido.',
                    'password.required' => 'La contraseña es requerida.',
                    'password.min' => 'La contraseña debe tener mínimo 6 caracteres.',
                    'password.confirmed' => 'Las contraseñas no coinciden.',
                ]
            );

            DB::beginTransaction();

            /////////// Mapear tipo de empleado a valores válidos del enum
            $userRole = $data['employeeType'] === 'Admin' ? 'admin' : 'empleado';

            /////////// Crear usuario en tabla 'users'
            $user = User::create([
                'name' => $data['firstNameEmployee'] . ' ' . $data['lastNameEmployee'],
                'email' => $data['emailEmployee'],
                'password' => Hash::make($data['password']),
                'role' => $userRole, // 'admin' o 'empleado'
            ]);

            /////////// Procesar foto si existe
            if ($request->hasFile('photoEmployee')) {
                $path = $request->file('photoEmployee')->store('employees', 'public');
                $data['photoEmployee'] = $path;
            } else {
                $data['photoEmployee'] = '';
            }

            /////////// Establecer valores por defecto
            $data['specialty'] = $request->input('specialty', $data['specialty'] ?? null);

            if ($request->has('isAvailable')) {
                $data['isAvailable'] = filter_var($request->input('isAvailable'), FILTER_VALIDATE_BOOLEAN);
            } else {
                $data['isAvailable'] = $data['isAvailable'] ?? true;
            }

            /////////// Hash de contraseña para Employee
            $data['password'] = Hash::make($data['password']);

            /////////// Agregar user_id al empleado
            $data['user_id'] = $user->id;

            /////////// Crear empleado en tabla 'employees'
            $employee = Employee::create($data);

            DB::commit();

            return response()->json([
                'success' => true,
                'user' => $user,
                'employee' => $employee,
                'message' => 'Usuario y empleado registrados correctamente'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar: ' . $e->getMessage()
            ], 500);
        }
    }
}
