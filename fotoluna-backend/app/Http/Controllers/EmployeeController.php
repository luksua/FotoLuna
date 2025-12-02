<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Package;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    /**
     * Devuelve promedio de puntuaciones para cada fotógrafo/empleado
     */
    public function ratings()
    {
        $employees = Employee::all();
        
        $data = $employees->map(function ($emp) {
            // Obtener user_id del empleado
            $userId = $emp->user_id;
            
            // Calcular promedio de comentarios donde photographer_id = user_id
            $avgRating = Comment::where('photographer_id', $userId)
                ->avg('rating');
            
            return [
                'employeeId' => $emp->employeeId,
                'name' => trim($emp->firstNameEmployee . ' ' . $emp->lastNameEmployee),
                'averageRating' => $avgRating ? round($avgRating, 2) : 0,
            ];
        });
        
        return response()->json(['success' => true, 'data' => $data], 200);
    }

    /**
     * Devuelve todos los empleados para el selector de fotógrafo (público)
     */
    public function all()
    {
        $employees = Employee::select('employeeId as id', 'firstNameEmployee', 'lastNameEmployee', 'photoEmployee', 'emailEmployee', 'user_id')
            // ->where('isAvailable', true)
            ->get();

        return response()->json(
            $employees->map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'name' => trim($emp->firstNameEmployee . ' ' . $emp->lastNameEmployee),
                    'photo' => $emp->photoEmployee ? url('storage/' . $emp->photoEmployee) : null,
                    'email' => $emp->emailEmployee,
                    'user_id' => $emp->user_id,
                ];
            })
        );
    }

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
    public function available(Request $request)
    {
        $date = $request->input('appointmentDate');
        $time = $request->input('appointmentTime');
        $packageId = $request->input('packageIdFK');
        $documentTypeId = $request->input('documentTypeId');

        if (!$packageId && !$documentTypeId) {
            return response()->json([
                'error' => 'Debe enviar packageIdFK o documentTypeId',
            ], 422);
        }

        $duration = 60; // default

        if ($packageId) {
            $package = Package::find($packageId);

            if (!$package) {
                return response()->json([
                    'error' => 'El paquete no existe',
                ], 404);
            }

            $duration = $package->durationMinutes ?? $duration;
        } elseif ($documentTypeId) {
            // Si algún día document_types tiene duración, la lees aquí.
        }

        $employees = Employee::availablePhotographers($date, $time, $duration)
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
            return response()->json([], 200);
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


    // public function available(Request $request)
    // {
    //     $date = $request->input('appointmentDate');
    //     $time = $request->input('appointmentTime');
    //     $packageId = $request->input('packageIdFK');

    //     if (!$packageId) {
    //         return response()->json([
    //             'error' => 'packageIdFK es requerido'
    //         ], 422);
    //     }

    //     $package = Package::find($packageId);

    //     if (!$package) {
    //         return response()->json([
    //             'error' => 'El paquete no existe'
    //         ], 404);
    //     }

    //     $duration = $package->durationMinutes; // minutos del paquete

    //     $employees = Employee::availablePhotographers($date, $time, $duration)
    //         ->select(
    //             'employeeId as id',
    //             'firstNameEmployee',
    //             'lastNameEmployee',
    //             'photoEmployee',
    //             'specialty',
    //             'emailEmployee'
    //         )
    //         ->get();

    //     if ($employees->isEmpty()) {
    //         return response()->json([], 200);
    //     }

    //     return response()->json(
    //         $employees->map(function ($emp) {
    //             return [
    //                 'id' => $emp->id,
    //                 'name' => "{$emp->firstNameEmployee} {$emp->lastNameEmployee}",
    //                 'photo' => $emp->photoEmployee
    //                     ? url('storage/' . $emp->photoEmployee)
    //                     : url('images/default-user.jpg'),
    //                 'specialty' => $emp->specialty ?? 'Fotografía general',
    //                 'email' => $emp->emailEmployee,
    //             ];
    //         })
    //     );
    // }



    // public function available()
    // {
    //     $employees = Employee::availablePhotographers()
    //         ->select(
    //             'employeeId as id',
    //             'firstNameEmployee',
    //             'lastNameEmployee',
    //             'photoEmployee',
    //             'specialty',
    //             'emailEmployee'
    //         )
    //         ->get();

    //     if ($employees->isEmpty()) {
    //         if ($employees->isEmpty()) {
    //             return response()->json([], 200);
    //         }
    //         return response()->json($employees);

    //     }

    //     return response()->json(
    //         $employees->map(function ($emp) {
    //             return [
    //                 'id' => $emp->id,
    //                 'name' => "{$emp->firstNameEmployee} {$emp->lastNameEmployee}",
    //                 'photo' => $emp->photoEmployee
    //                     ? url('storage/' . $emp->photoEmployee)
    //                     : url('images/default-user.jpg'),
    //                 'specialty' => $emp->specialty ?? 'Fotografía general',
    //                 'email' => $emp->emailEmployee,
    //             ];
    //         })
    //     );
    // }

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
