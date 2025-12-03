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

            // 🚨 CAMPO AÑADIDO: ID del empleado que crea al cliente
            // El frontend lo envía siempre si es un registro manual por un empleado.
            'employee_id' => 'nullable|integer|exists:users,id',
            // Usamos 'required_if:role,cliente' para asegurar que se envíe solo al crear un cliente.

            // campos específicos para cliente (se validan si role == cliente)
            'firstNameCustomer' => 'required_if:role,cliente|string|max:255',
            'lastNameCustomer' => 'required_if:role,cliente|string|max:255',
            // HE CORREGIDO la sintaxis de 'nullable' aquí
            'phoneCustomer' => 'nullable|string|max:255',
            'documentType' => 'nullable|in:CC,CE,PAS',
            'documentNumber' => 'nullable|string|max:255',
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