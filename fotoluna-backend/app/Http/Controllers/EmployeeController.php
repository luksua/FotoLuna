<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Retorna empleados disponibles para asignación.
     */
    public function available()
    {
        $employees = Employee::availablePhotographers()
            ->select(
                'employeeId as id',
                'firstNameEmployee',
                'lastNameEmployee',
                'photoEmployee',
                'specialty',
                'emailEmployee'
            )
            ->get();

        if ($employees->isEmpty()) {
            if ($employees->isEmpty()) {
                return response()->json([], 200);
            }
            return response()->json($employees);

        }

        return response()->json(
            $employees->map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'name' => "{$emp->firstNameEmployee} {$emp->lastNameEmployee}",
                    'photo' => $emp->photoEmployee
                        ? url('storage/' . $emp->photoEmployee)
                        : url('images/default-user.jpg'),
                    'specialty' => $emp->specialty ?? 'Fotografía general',
                    'email' => $emp->emailEmployee,
                ];
            })
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        //
    }
}
