<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class AdminUsersController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employees = Employee::orderBy('firstNameEmployee')->get();

        $data = $employees->map(function ($e) {
            return [
                'id' => $e->employeeId,
                'firstName' => $e->firstNameEmployee,
                'lastName' => $e->lastNameEmployee,
                'name' => trim($e->firstNameEmployee . ' ' . $e->lastNameEmployee),
                'email' => $e->emailEmployee,
                'phone' => $e->phoneEmployee,
                'document' => $e->documentNumber,
                'avatar' => $e->photoEmployee ? asset('storage/' . ltrim($e->photoEmployee, '/')) : null,
                'role' => $e->role,
                'specialty' => $e->specialty,
                'isAvailable' => (bool) $e->isAvailable,
            ];
        });

        return response()->json(['success' => true, 'data' => $data], 200);
    }
    public function toggleAvailability(Request $request, $id): JsonResponse
    {
        $employee = Employee::find($id);
        if (! $employee) {
            return response()->json(['success' => false, 'message' => 'Empleado no encontrado'], 404);
        }

        if ($request->has('isAvailable')) {
            $val = $request->input('isAvailable');
            $employee->isAvailable = filter_var($val, FILTER_VALIDATE_BOOLEAN);
        } else {
            $employee->isAvailable = ! (bool) $employee->isAvailable;
        }

        $employee->save();

        return response()->json(['success' => true, 'isAvailable' => (bool) $employee->isAvailable], 200);
    }
}
