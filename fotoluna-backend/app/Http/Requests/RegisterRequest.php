<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            // datos usados para la tabla users
            'name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|in:admin,empleado,cliente',

            // campos específicos para cliente (se validan si role == cliente)
            'firstNameCustomer' => 'required_if:role,cliente|string|max:255',
            'lastNameCustomer' => 'required_if:role,cliente|string|max:255',
            'phoneCustomer' => 'nullable:role,cliente|string|max:255',
            'documentType' => 'nullable:role,cliente|in:CC,CE,PAS',
            'documentNumber' => 'nullable:role,cliente|string|max:255',
            'photoCustomer' => 'sometimes|file|image|max:5120',

            // campos específicos para empleado (se validan si role == empleado)
            'firstNameEmployee' => 'required_if:role,empleado|string|max:255',
            'lastNameEmployee' => 'required_if:role,empleado|string|max:255',
            'phoneEmployee' => 'nullable:role,empleado|string|max:255',
            'address' => 'nullable:role,empleado|string|max:255',
            'documentTypeEmployee' => 'nullable:role,empleado|in:CC,CE,PAS',
            'documentNumberEmployee' => 'nullable:role,empleado|string|max:255',
            'photoEmployee' => 'nullable:role,empleado|string|max:255',
            'employeeType' => 'nullable:role,empleado|in:Employee,Admin',
            'gender' => 'nullable:role,empleado|in:Female,Male,Other',
            'EPS' => 'nullable:role,empleado|string|max:255',
            // email/password for employees/customers will be stored in users table for auth
        ];
    }
}