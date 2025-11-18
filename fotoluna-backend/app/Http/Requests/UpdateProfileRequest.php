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
            'name' => 'sometimes|required|string|max:100',
            'lastName' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|max:150',
            'avatar' => 'sometimes|nullable|image|mimes:jpeg,png,jpg|max:2048',
        ];
    }
}