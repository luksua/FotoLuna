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
        $customer = $user->customer ?? Customer::firstOrCreate(
            ['user_id' => $user->id],
            [
                'firstNameCustomer' => $request->input('nombre', ''),
                'lastNameCustomer' => $request->input('apellido', ''),
                'emailCustomer' => $request->input('email', $user->email),
            ]
        );

        // Actualiza campos
        $customer->fill([
            'firstNameCustomer' => $request->input('nombre', $customer->firstNameCustomer),
            'lastNameCustomer' => $request->input('apellido', $customer->lastNameCustomer),
            'emailCustomer' => $request->input('email', $customer->emailCustomer),
        ]);

        // Guardar avatar si se sube
        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            if ($customer->photoCustomer) {
                Storage::disk('public')->delete($customer->photoCustomer);
            }
            $path = $request->file('avatar')->store('customers', 'public');
            $customer->photoCustomer = $path;
        }

        $customer->save();

        if ($request->filled('email') && $user->email !== $request->input('email')) {
            $user->email = $request->input('email');
            $user->save();
        }

        $photo = $customer->photoCustomer;
        $photoUrl = $photo ? url('storage/' . ltrim($photo, '/')) : null;

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user' => $user->fresh()->load('customer'),
            'photo' => $photoUrl,
        ]);
    }

    /**
     * POST /api/customer/password
     */
    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = $request->user();

        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json(['message' => 'Contraseña actual incorrecta.'], 401);
        }

        $newHashed = Hash::make($request->input('new_password'));
        $user->password = $newHashed;
        $user->save();

        // sincronizar con customers.password si existe
        $customer = $user->customer ?? Customer::where('user_id', $user->id)->first();
        if ($customer) {
            $customer->password = $newHashed;
            $customer->save();
        }

        return response()->json(['message' => 'Contraseña actualizada correctamente.'], 200);
    }
}