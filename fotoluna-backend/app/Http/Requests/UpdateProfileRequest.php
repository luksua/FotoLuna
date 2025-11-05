<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        $userId = $this->user()->id;

        return [
            'name' => ['nullable', 'string', 'max:255'],
            'lastName' => ['nullable', 'string', 'max:255'],
            // Se valida unicidad contra la tabla users (si la email principal está ahí)
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'avatar' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ];
    }
}