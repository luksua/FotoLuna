<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function __construct()
    {
        // Ajusta el guard si no usas sanctum: 'auth:api' u otro
        $this->middleware('auth:sanctum');
    }

    /**
     * POST /api/customer
     */
    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();

        // Actualizar nombre y email en la tabla users
        if ($request->filled('name')) {
            $user->name = $request->input('name');
        }

        if ($request->filled('email') && $user->email !== $request->input('email')) {
            $user->email = $request->input('email');
        }

        $user->save();

        // Determinar si es cliente o empleado y actualizar según corresponda
        if ($user->customer) {
            // Usuario es cliente - actualizar tabla customers
            $customer = $user->customer;
            $customer->fill([
                'firstNameCustomer' => $request->input('name', $customer->firstNameCustomer),
                'emailCustomer' => $request->input('email', $customer->emailCustomer),
            ]);

            // Guardar avatar en customers
            if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
                if ($customer->photoCustomer) {
                    Storage::disk('public')->delete($customer->photoCustomer);
                }
                $path = $request->file('avatar')->store('customers', 'public');
                $customer->photoCustomer = $path;
            }

            $customer->save();
            $photo = $customer->photoCustomer;
            $photoUrl = $photo ? url('storage/' . ltrim($photo, '/')) : null;
            
        } elseif ($user->employee) {
            // Usuario es empleado - actualizar tabla employees
            $employee = $user->employee;
            $employee->fill([
                'firstNameEmployee' => $request->input('name', $employee->firstNameEmployee),
                'emailEmployee' => $request->input('email', $employee->emailEmployee),
            ]);

            // Guardar avatar en employees
            if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
                if ($employee->photoEmployee) {
                    Storage::disk('public')->delete($employee->photoEmployee);
                }
                $path = $request->file('avatar')->store('employees', 'public');
                $employee->photoEmployee = $path;
            }

            $employee->save();
            $photo = $employee->photoEmployee;
            $photoUrl = $photo ? url('storage/' . ltrim($photo, '/')) : null;
            
        } else {
            // Fallback - usuario sin relación customer ni employee
            $photoUrl = null;
        }

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user' => $user->fresh()->load('customer', 'employee'),
            'photo' => $photoUrl,
        ]);
    }

    /**
     * POST /api/customer/password
     */
    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = $request->user();

        // Verificar que la contraseña actual sea correcta
        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json(
                ['message' => 'Contraseña actual incorrecta.'],
                401
            );
        }

        // Validar que la nueva contraseña sea diferente
        if (Hash::check($request->input('new_password'), $user->password)) {
            return response()->json(
                ['message' => 'La nueva contraseña no puede ser igual a la actual.'],
                422
            );
        }

        // Encriptar y guardar la nueva contraseña
        $newHashed = Hash::make($request->input('new_password'));
        $user->password = $newHashed;
        $user->save();

        // Sincronizar con customers.password si existe
        $customer = $user->customer ?? Customer::where('user_id', $user->id)->first();
        if ($customer) {
            $customer->password = $newHashed;
            $customer->save();
        }

        return response()->json(
            ['message' => 'Contraseña actualizada correctamente.'],
            200
        );
    }
}