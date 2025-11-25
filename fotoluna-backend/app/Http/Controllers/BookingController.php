<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Employee;
use App\Models\BookingPhoto;

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
        // Validar lo que pueda venir de ambos flujos
        $validated = $request->validate([
            'packageIdFK' => 'nullable|exists:packages,packageId',      // flujo paquetes
            'documentTypeId' => 'nullable|exists:document_types,id',       // flujo documentos
            'place' => 'nullable|string|max:255',                 // lugar para appointment
            'photo' => 'nullable|image|max:5120',                 // archivo para documentos
        ]);

        // Debe venir al menos paquete O documento
        if (empty($validated['packageIdFK']) && empty($validated['documentTypeId'])) {
            return response()->json([
                'message' => 'Debe enviar packageIdFK o documentTypeId',
            ], 422);
        }

        // Verifica que la cita exista
        $appointment = Appointment::findOrFail($appointmentId);

        // Si viene lugar, lo guardamos en appointments
        if (!empty($validated['place'])) {
            $appointment->update([
                'place' => $validated['place'],
            ]);
        }

        $booking = Booking::create([
            'appointmentIdFK' => $appointment->appointmentId,
            'packageIdFK' => $validated['packageIdFK'] ?? null,
            'documentTypeIdFK' => $validated['documentTypeId'] ?? null,
            'employeeIdFK' => null,
            'bookingStatus' => 'Pending',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('documents', 'public');

            BookingPhoto::create([
                'bookingIdFK' => $booking->bookingId,
                'photoPath' => $path,
                'photoDescription' => null,
                'employeeIdFK' => null,
            ]);
        }

        // Opcional: cambia el estado de la cita
        $appointment->update(['appointmentStatus' => 'Pending confirmation']);

        return response()->json([
            'message' => 'Reserva creada correctamente',
            'bookingId' => $booking->bookingId,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking)
    {
        // Cargar relaciones necesarias
        $booking->load([
            'appointment.customer',
            'appointment.event',   // 👈 NECESARIO
            'package',
            'documentType'
        ]);

        $appointment = $booking->appointment;
        $event = $appointment?->event;
        $customer = $appointment?->customer;
        $package = $booking->package;
        $document = $booking->documentType;

        // Calcular total
        $total = 0;
        if ($package) {
            $total = $package->price;
        } elseif ($document) {
            $total = $document->price;
        }

        return response()->json([
            'bookingId' => $booking->bookingId,
            'bookingStatus' => $booking->bookingStatus,

            'total' => $total,

            'event' => $event ? [
                'id' => $event->eventId,
                'name' => $event->eventType,
                'category' => $event->category ?? null,
            ] : null,

            'package' => $package ? [
                'id' => $package->packageId,
                'name' => $package->packageName,
                'price' => $package->price,
            ] : null,

            'documentType' => $document ? [
                'id' => $document->id,
                'name' => $document->name,
                'price' => $document->price,
            ] : null,

            'appointment' => $appointment ? [
                'date' => $appointment->appointmentDate,
                'time' => $appointment->appointmentTime,
                'place' => $appointment->place,
            ] : null,

            'customer' => $customer ? [
                'id' => $customer->customerId,
                'name' => $customer->firstName . ' ' . $customer->lastName,
                'email' => $customer->emailCustomer,
            ] : null,
        ]);
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
