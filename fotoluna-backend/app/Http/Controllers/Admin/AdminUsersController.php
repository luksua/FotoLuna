<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Customer;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class AdminUsersController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $employees = Employee::orderBy('firstNameEmployee')->get();

        $data = $employees->map(function ($e) {
            return [
                'id' => 'emp_' . $e->employeeId,
                'uniqueId' => $e->employeeId,
                'type' => 'employee',
                'firstName' => $e->firstNameEmployee,
                'lastName' => $e->lastNameEmployee,
                'name' => trim($e->firstNameEmployee . ' ' . $e->lastNameEmployee),
                'email' => $e->emailEmployee,
                'phone' => $e->phoneEmployee,
                'document' => $e->documentNumber,
                'address' => $e->address,
                'EPS' => $e->EPS,
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
        $employee = Employee::where('employeeId', $id)->first();
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

    public function update(Request $request, $id): JsonResponse
    {
        $employee = Employee::where('employeeId', $id)->first();
        if (! $employee) {
            return response()->json(['success' => false, 'message' => 'Empleado no encontrado'], 404);
        }

        $validated = $request->validate([
            'firstNameEmployee' => 'nullable|string|max:255',
            'lastNameEmployee' => 'nullable|string|max:255',
            'phoneEmployee' => 'nullable|string|max:255',
            'emailEmployee' => 'nullable|email|max:255|unique:employees,emailEmployee,'.$employee->employeeId.',employeeId',
            'documentNumber' => 'nullable|string|max:255|unique:employees,documentNumber,'.$employee->employeeId.',employeeId',
            'address' => 'nullable|string|max:255',
            'EPS' => 'nullable|string|max:255',
        ]);

        $employee->update($validated);

        return response()->json(['success' => true, 'employee' => $employee], 200);
    }

    public function getCustomers(Request $request): JsonResponse
    {
        $customers = Customer::orderBy('firstNameCustomer')->get();

        $data = $customers->map(function ($c) {
            return [
                'id' => 'cust_' . $c->customerId,
                'uniqueId' => $c->customerId,
                'type' => 'customer',
                'firstName' => $c->firstNameCustomer,
                'lastName' => $c->lastNameCustomer,
                'name' => trim($c->firstNameCustomer . ' ' . $c->lastNameCustomer),
                'email' => $c->emailCustomer,
                'phone' => $c->phoneCustomer,
                'document' => $c->documentNumber,
                'avatar' => $c->photoCustomer ? asset('storage/' . ltrim($c->photoCustomer, '/')) : null,
            ];
        });

        return response()->json(['success' => true, 'data' => $data], 200);
    }
}
