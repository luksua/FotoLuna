<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'], // requiere new_password_confirmation
        ];
    }

    public function messages()
    {
        return [
            'new_password.confirmed' => 'La confirmación de la nueva contraseña no coincide.',
        ];
    }
}