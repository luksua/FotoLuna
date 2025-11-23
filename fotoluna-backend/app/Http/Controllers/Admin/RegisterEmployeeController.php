<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class RegisterEmployeeController extends Controller
{
    /**
     * Store a newly created employee in storage.
     * This is intentionally simple and straightforward.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'firstNameEmployee' => 'required|string|max:255',
            'lastNameEmployee' => 'required|string|max:255',
            'phoneEmployee' => 'required|string|max:255',
            'EPS' => 'required|string|max:255',
            'documentType' => 'required|in:CC,CE,PAS',
            'documentNumber' => 'required|string|max:255|unique:employees,documentNumber',
            'emailEmployee' => 'required|email|max:255|unique:employees,emailEmployee',
            'address' => 'required|string|max:255',
            'password' => 'required|string|min:6',
            'employeeType' => 'required|in:Employee,Admin',
            'gender' => 'required|in:Female,Male,Other',
            'photoEmployee' => 'nullable|image|max:2048',
        ]);

        // handle file upload (store in storage/app/public/employees)
        if ($request->hasFile('photoEmployee')) {
            $path = $request->file('photoEmployee')->store('employees', 'public');
            $data['photoEmployee'] = $path;
        } else {
            $data['photoEmployee'] = '';
        }

        // hash password
        $data['password'] = Hash::make($data['password']);

        // create employee
        $employee = Employee::create($data);

        return response()->json(['success' => true, 'employee' => $employee], 201);
    }
}
