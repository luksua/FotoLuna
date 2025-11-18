<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Employee;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(Request $request, $appointmentId)
    {
        $request->validate([
            'packageIdFK' => 'required|exists:packages,packageId',
        ]);

        // Verifica que la cita exista
        $appointment = Appointment::findOrFail($appointmentId);

        // Crea el booking
        $booking = Booking::create([
            'appointmentIdFK' => $appointment->appointmentId,
            'packageIdFK' => $request->packageIdFK,
            'employeeIdFK' => null,
            'bookingStatus' => 'Pending',
        ]);

        // Opcional: cambia el estado de la cita
        $appointment->update(['appointmentStatus' => 'Pending confirmation']);

        return response()->json([
            'message' => 'Booking created successfully',
            'bookingId' => $booking->bookingId,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Booking $booking)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $bookingId)
    {
        $validated = $request->validate([
            'employeeIdFK' => 'nullable|exists:employees,employeeId',
            'bookingStatus' => 'nullable|string|in:Pending,Confirmed,Completed,Cancelled',
        ]);

        $booking = Booking::findOrFail($bookingId);

        if (isset($validated['employeeIdFK'])) {
            $employee = Employee::where('employeeId', $validated['employeeIdFK'])->first();

            if (!$employee) {
                return response()->json(['message' => 'El fotógrafo no existe.'], 404);
            }

            if (!$employee->isAvailable) {
                return response()->json(['message' => 'Este fotógrafo no está disponible.'], 409);
            }

            $booking->employeeIdFK = $employee->employeeId;
            $employee->update(['isAvailable' => false]);
        }

        if (isset($validated['bookingStatus'])) {
            $booking->bookingStatus = $validated['bookingStatus'];
        }

        $booking->save();

        return response()->json([
            'message' => 'Fotógrafo asignado y cita actualizada con éxito.',
            'booking' => $booking
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Booking $booking)
    {
        //
    }
}
