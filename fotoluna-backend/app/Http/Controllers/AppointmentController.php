<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
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
    public function store(Request $request)
    {
        try {
            \Log::info('Datos recibidos en store appointment:', $request->all());

            // ✅ Validar entrada
            $validator = Validator::make($request->all(), [
                'eventIdFK' => 'required|exists:events,eventId',
                'appointmentDate' => 'required|date|after_or_equal:today',
                'appointmentTime' => 'required|string',
                'place' => 'required|string|max:100',
                'comment' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // ✅ Obtener el cliente del usuario autenticado
            $user = auth()->user();

            if (!$user || !$user->customer) {
                return response()->json([
                    'message' => 'El usuario autenticado no tiene un cliente asociado'
                ], 403);
            }

            $customerId = $user->customer->customerId;

            // ✅ Crear la cita
            $appointment = Appointment::create([
                'customerIdFK' => $customerId,
                'eventIdFK' => $request->eventIdFK,
                'appointmentDate' => $request->appointmentDate,
                'appointmentTime' => $request->appointmentTime,
                'place' => $request->place,
                'comment' => $request->comment,
                'appointmentStatus' => 'Pending confirmation',
            ]);

            // ✅ Respuesta JSON limpia
            return response()->json([
                'message' => 'Cita creada correctamente',
                'appointmentId' => $appointment->appointmentId,
                'status' => $appointment->appointmentStatus,
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('Error al crear cita: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // public function getAvailability(Request $request)
    // {
    //     $request->validate([
    //         'date' => 'required|date',
    //     ]);

    //     $baseSlots = [
    //         '08:00:00',
    //         '09:00:00',
    //         '10:00:00',
    //         '11:00:00',
    //         '12:00:00',
    //         '14:00:00',
    //         '15:00:00',
    //         '16:00:00',
    //         '17:00:00',
    //         '18:00:00',
    //     ];

    //     $date = $request->date;
    //     $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek; // 0=Domingo, 6=Sábado

    //     // Si es domingo, limita horarios
    //     if ($dayOfWeek === 0) {
    //         $baseSlots = ['09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00']; // menos horas
    //     }

    //     // Si el día ya pasó, todo bloqueado
    //     if (\Carbon\Carbon::parse($date)->isBefore(\Carbon\Carbon::today())) {
    //         return response()->json(['available' => [], 'allBlocked' => true]);
    //     }


    //     // Obtén las citas existentes para ese día
    //     $appointments = Appointment::whereDate('appointmentDate', $date)
    //         ->whereIn('appointmentStatus', ['Scheduled', 'Pending confirmation'])
    //         ->pluck('appointmentTime')
    //         ->toArray();

    //     // Calcula los horarios disponibles
    //     $availableSlots = array_values(array_diff($baseSlots, $appointments));

    //     $allBlocked = count($availableSlots) === 0;

    //     return response()->json([
    //         'available' => $availableSlots,
    //         'blocked' => $appointments,
    //         'allBlocked' => $allBlocked,
    //     ]);
    // }

    // public function getMonthlyAvailability(Request $request)
    // {
    //     $month = $request->query('month', now()->month);
    //     $year = $request->query('year', now()->year);

    //     $days = [];
    //     $baseSlots = [
    //         '09:00:00',
    //         '09:30:00',
    //         '10:00:00',
    //         '10:30:00',
    //         '11:00:00',
    //         '11:30:00',
    //         '12:00:00',
    //         '14:00:00',
    //         '14:30:00',
    //         '15:00:00',
    //         '15:30:00',
    //         '16:00:00',
    //         '16:30:00',
    //         '17:00:00',
    //     ];

    //     $appointments = Appointment::whereMonth('appointmentDate', $month)
    //         ->whereYear('appointmentDate', $year)
    //         ->whereIn('appointmentStatus', ['Scheduled', 'Pending confirmation'])
    //         ->get(['appointmentDate', 'appointmentTime']);

    //     $grouped = $appointments->groupBy(fn($a) => $a->appointmentDate->format('Y-m-d'));

    //     foreach ($grouped as $date => $slots) {
    //         $taken = $slots->pluck('appointmentTime')->toArray();
    //         $available = array_diff($baseSlots, $taken);
    //         $days[$date] = [
    //             'allBlocked' => count($available) === 0,
    //         ];
    //     }

    //     return response()->json($days);
    // }

    public function availability(Request $request)
    {
        $baseSlots = [
            '08:00:00',
            '09:00:00',
            '10:00:00',
            '11:00:00',
            '12:00:00',
            '13:00:00',
            '14:00:00',
            '15:00:00',
            '16:00:00',
            '17:00:00',
            '18:00:00',
            '19:00:00',
        ];

        $date = $request->query('date');
        $month = $request->query('month');
        $year = $request->query('year', now()->year);

        // Si piden disponibilidad de un día específico:
        if ($date) {
            $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek;

            // Bloquear domingos o días pasados
            if (\Carbon\Carbon::parse($date)->isBefore(\Carbon\Carbon::today())) {
                return response()->json([
                    'available' => [],
                    'blocked' => [],
                    'allBlocked' => true,
                ]);
            }

            // Limitar horarios los domingos (opcional)
            if ($dayOfWeek === 0) {
                $baseSlots = ['09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00', '16:00:00'];
            }

            $appointments = Appointment::whereDate('appointmentDate', $date)
                ->whereIn('appointmentStatus', ['Scheduled', 'Pending confirmation'])
                ->pluck('appointmentTime')
                ->toArray();

            $available = array_values(array_diff($baseSlots, $appointments));
            $allBlocked = count($available) === 0;

            return response()->json([
                'available' => $available,
                'blocked' => $appointments,
                'allBlocked' => $allBlocked,
            ]);
        }

        // Si piden disponibilidad mensual (month + year)
        if ($month) {
            $appointments = Appointment::whereMonth('appointmentDate', $month)
                ->whereYear('appointmentDate', $year)
                ->whereIn('appointmentStatus', ['Scheduled', 'Pending confirmation'])
                ->get(['appointmentDate', 'appointmentTime']);

            $grouped = $appointments->groupBy(function ($a) {
                return \Carbon\Carbon::parse($a->appointmentDate)->format('Y-m-d');
            });

            $days = [];
            foreach ($grouped as $d => $slots) {
                $taken = $slots->pluck('appointmentTime')->toArray();
                $available = array_diff($baseSlots, $taken);
                $days[$d] = ['allBlocked' => count($available) === 0];
            }

            return response()->json($days);
        }

        // Si no se pasó parámetro, error
        return response()->json(['message' => 'Debe proporcionar date o month'], 400);
    }



    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Appointment $appointment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'packageId' => 'nullable|exists:packages,id',
            'appointmentStatus' => 'required|string',
        ]);

        $appointment->update($validated);

        return response()->json([
            'message' => 'Cita actualizada correctamente',
            'appointment' => $appointment,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        //
    }
}
