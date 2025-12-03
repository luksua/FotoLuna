<?php


namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Appointment;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\BookingAssignedToEmployee;
use App\Notifications\PhotographerAssignedClient;

use App\Models\BookingPaymentInstallment;


use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Throwable;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

use App\Models\Employee;

use Illuminate\Validation\Rule;

class AdminAppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Parámetros que manda el front
        $perPage = $request->integer('per_page', 10);
        $page = $request->integer('page', 1);

        $search = $request->get('search');          // filtro texto (cliente / evento)
        $status = $request->get('status', 'all');   // 'all' | 'Pending_assignment' | ...
        $assigned = $request->get('assigned', 'all'); // 'all' | 'assigned' | 'unassigned'
        $sort = $request->get('sort', 'all');     // 'newest' | 'oldest' | 'all'

        $query = Booking::query()
            ->join('appointments', 'appointments.appointmentId', '=', 'bookings.appointmentIdFK')
            ->join('customers', 'customers.customerId', '=', 'appointments.customerIdFK')
            ->leftJoin('events', 'events.eventId', '=', 'appointments.eventIdFK')
            ->leftJoin('employees', 'employees.employeeId', '=', 'bookings.employeeIdFK')
            ->selectRaw('
            appointments.appointmentId AS appointmentId,
            bookings.bookingId AS bookingId,
            appointments.appointmentDate AS date,
            appointments.appointmentTime AS time,
            appointments.place AS place,
            appointments.comment AS comment,
            appointments.appointmentStatus AS status,
            
            customers.firstNameCustomer AS clientFirstName,
            customers.lastNameCustomer AS clientLastName,
            customers.emailCustomer AS clientEmail,
            customers.documentNumber AS clientDocument,

            events.eventType AS eventName,

            employees.employeeId AS employeeId,
            employees.firstNameEmployee AS employeeFirstName,
            employees.lastNameEmployee AS employeeLastName
        ');

        // ---- Filtro texto (cliente o evento) ----
        if ($search) {
            $search = trim($search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw("CONCAT(customers.firstNameCustomer, ' ', customers.lastNameCustomer) LIKE ?", ['%' . $search . '%'])
                    ->orWhere('events.eventType', 'LIKE', '%' . $search . '%');
            });
        }

        // ---- Filtro por estado ----
        if ($status && $status !== 'all') {
            $query->where('appointments.appointmentStatus', $status);
        }

        // ---- Filtro por asignación ----
        if ($assigned === 'assigned') {
            $query->whereNotNull('bookings.employeeIdFK');
        } elseif ($assigned === 'unassigned') {
            $query->whereNull('bookings.employeeIdFK');
        }

        // ---- Orden ----
        if ($sort === 'newest') {
            $query->orderByDesc('appointments.appointmentDate')
                ->orderByDesc('appointments.appointmentTime');
        } elseif ($sort === 'oldest') {
            $query->orderBy('appointments.appointmentDate')
                ->orderBy('appointments.appointmentTime');
        } else {
            // orden por defecto (como lo tenías)
            $query->orderBy('appointments.appointmentDate')
                ->orderBy('appointments.appointmentTime');
        }

        // ---- Paginación ----
        $rows = $query->paginate($perPage, ['*'], 'page', $page);

        // Transformamos solo la colección, conservando los metadatos del paginator
        $rows->getCollection()->transform(function ($r) {
            return [
                'appointmentId' => $r->appointmentId,
                'bookingId' => $r->bookingId,
                'date' => $r->date,
                'time' => substr($r->time, 0, 5),
                'place' => $r->place,
                'comment' => $r->comment,
                'status' => $r->status,

                'clientName' => trim($r->clientFirstName . ' ' . $r->clientLastName),
                'clientEmail' => $r->clientEmail,
                'clientDocument' => $r->clientDocument,

                'eventName' => $r->eventName,

                'employeeId' => $r->employeeId,
                'employeeName' => $r->employeeId
                    ? trim($r->employeeFirstName . ' ' . $r->employeeLastName)
                    : null,
            ];
        });

        // Devuelve paginator completo (data + meta)
        return response()->json($rows);
    }
    // public function index(Request $request)
    // {
    //     $rows = Booking::query()
    //         ->join('appointments', 'appointments.appointmentId', '=', 'bookings.appointmentIdFK')
    //         ->join('customers', 'customers.customerId', '=', 'appointments.customerIdFK')
    //         ->leftJoin('events', 'events.eventId', '=', 'appointments.eventIdFK')
    //         ->leftJoin('employees', 'employees.employeeId', '=', 'bookings.employeeIdFK')
    //         ->selectRaw('
    //         appointments.appointmentId AS appointmentId,
    //         bookings.bookingId AS bookingId,
    //         appointments.appointmentDate AS date,
    //         appointments.appointmentTime AS time,
    //         appointments.place AS place,
    //         appointments.comment AS comment,
    //         appointments.appointmentStatus AS status,

    //         customers.firstNameCustomer AS clientFirstName,
    //         customers.lastNameCustomer AS clientLastName,
    //         customers.emailCustomer AS clientEmail,
    //         customers.documentNumber AS clientDocument,

    //         events.eventType AS eventName,

    //         employees.employeeId AS employeeId,
    //         employees.firstNameEmployee AS employeeFirstName,
    //         employees.lastNameEmployee AS employeeLastName
    //     ')
    //         ->orderBy('appointments.appointmentDate')
    //         ->orderBy('appointments.appointmentTime')
    //         ->get();

    //     $data = $rows->map(function ($r) {
    //         return [
    //             'appointmentId' => $r->appointmentId,
    //             'bookingId' => $r->bookingId,
    //             'date' => $r->date,
    //             'time' => substr($r->time, 0, 5),
    //             'place' => $r->place,
    //             'comment' => $r->comment,
    //             'status' => $r->status,

    //             'clientName' => trim($r->clientFirstName . ' ' . $r->clientLastName),
    //             'clientEmail' => $r->clientEmail,
    //             'clientDocument' => $r->clientDocument,

    //             'eventName' => $r->eventName,

    //             'employeeId' => $r->employeeId,
    //             'employeeName' => $r->employeeId
    //                 ? trim($r->employeeFirstName . ' ' . $r->employeeLastName)
    //                 : null,
    //         ];
    //     });

    //     return response()->json($data);
    // }

    public function unassigned(Request $request)
    {
        $rows = Booking::query()
            ->whereNull('employeeIdFK') // SIN fotógrafo asignado
            ->join('appointments', 'appointments.appointmentId', '=', 'bookings.appointmentIdFK')
            ->join('customers', 'customers.customerId', '=', 'appointments.customerIdFK')
            ->leftJoin('events', 'events.eventId', '=', 'appointments.eventIdFK')
            ->selectRaw('
                appointments.appointmentId AS appointmentId,
                bookings.bookingId AS bookingId,
                appointments.appointmentDate AS date,
                appointments.appointmentTime AS time,
                appointments.place AS place,
                appointments.comment AS comment,
                appointments.appointmentStatus AS status,
                
                customers.firstNameCustomer AS clientFirstName,
                customers.lastNameCustomer AS clientLastName,
                customers.emailCustomer AS clientEmail,
                customers.documentNumber AS clientDocument,

                events.eventType AS eventName
            ')
            ->orderBy('appointments.appointmentDate')
            ->orderBy('appointments.appointmentTime')
            ->get();

        // Formatear respuesta
        $data = $rows->map(function ($r) {
            return [
                'appointmentId' => $r->appointmentId,
                'bookingId' => $r->bookingId,
                'date' => $r->date,
                'time' => substr($r->time, 0, 5), // HH:MM
                'place' => $r->place,
                'comment' => $r->comment,
                'status' => $r->status,

                'clientName' => trim($r->clientFirstName . ' ' . $r->clientLastName),
                'clientEmail' => $r->clientEmail,
                'clientDocument' => $r->clientDocument,

                'eventName' => $r->eventName,
            ];
        });

        return response()->json($data);
    }

    public function employeesAvailability(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'time' => 'nullable|date_format:H:i',
        ]);

        $date = $request->query('date');
        $time = $request->query('time'); // opcional

        // 1. Todos los empleados
        $employees = Employee::select(
            'employeeId',
            'firstNameEmployee',
            'lastNameEmployee'
        )->get();

        $result = [];

        foreach ($employees as $emp) {

            // 2. Citas de ese empleado en ese día
            $citas = Booking::where('employeeIdFK', $emp->employeeId)
                ->join('appointments', 'appointments.appointmentId', '=', 'bookings.appointmentIdFK')
                ->whereDate('appointments.appointmentDate', $date)
                ->select('appointments.appointmentTime', 'appointments.appointmentStatus')
                ->get();

            // 3. ¿Está ocupado justo a esa hora?
            $ocupadoEnHora = false;

            if ($time) {
                $ocupadoEnHora = $citas->contains(function ($c) use ($time) {
                    return substr($c->appointmentTime, 0, 5) === $time
                        && in_array($c->appointmentStatus, ['Scheduled', 'Pending confirmation']);
                });
            }

            $result[] = [
                'employeeId' => $emp->employeeId,
                'name' => $emp->firstNameEmployee . ' ' . $emp->lastNameEmployee,
                'available' => !$ocupadoEnHora,
                'reason' => $ocupadoEnHora ? 'Tiene otra cita a esa hora' : null,
                'citasDelDia' => $citas->map(function ($c) {
                    return [
                        'time' => substr($c->appointmentTime, 0, 5),
                        'status' => $c->appointmentStatus,
                    ];
                }),
            ];
        }

        return response()->json($result);
    }
    public function candidates(Request $request, Appointment $appointment)
    {
        $date = $appointment->appointmentDate;
        $time = substr($appointment->appointmentTime, 0, 5);

        // 1. Todos los empleados (luego puedes filtrar por tipo si lo necesitas)
        $employees = Employee::select(
            'employeeId',
            'firstNameEmployee',
            'lastNameEmployee'
        )->get();

        $result = [];

        foreach ($employees as $emp) {
            // 2. Citas de ese empleado en ese día
            $citas = Booking::where('bookings.employeeIdFK', $emp->employeeId)
                ->join('appointments', 'appointments.appointmentId', '=', 'bookings.appointmentIdFK')
                ->whereDate('appointments.appointmentDate', $date)
                ->select('appointments.appointmentTime', 'appointments.appointmentStatus')
                ->get();

            $dayAppointmentsCount = $citas->count();

            // 3. ¿Está ocupado justo a esa hora? (misma lógica que employeesAvailability)
            $ocupadoEnHora = $citas->contains(function ($c) use ($time) {
                return substr($c->appointmentTime, 0, 5) === $time
                    && in_array($c->appointmentStatus, ['Scheduled', 'Pending confirmation']);
            });

            // 4. Etiqueta libre / parcial / ocupado
            if ($ocupadoEnHora) {
                $availabilityStatus = 'busy';
            } elseif ($dayAppointmentsCount >= 4) { // regla simple, ajusta a tu negocio
                $availabilityStatus = 'partial';
            } else {
                $availabilityStatus = 'free';
            }

            $result[] = [
                'employeeId' => $emp->employeeId,
                'name' => $emp->firstNameEmployee . ' ' . $emp->lastNameEmployee,
                'available' => !$ocupadoEnHora,
                'availabilityStatus' => $availabilityStatus, // libre/parcial/ocupado
                'dayAppointmentsCount' => $dayAppointmentsCount,
                'citasDelDia' => $citas->map(function ($c) {
                    return [
                        'time' => substr($c->appointmentTime, 0, 5),
                        'status' => $c->appointmentStatus,
                    ];
                }),
            ];
        }

        // 5. Score sencillo para sugerencia automática
        $employeesWithScore = collect($result)->map(function (array $row) {
            $availabilityFactor = match ($row['availabilityStatus']) {
                'free' => 1.0,
                'partial' => 0.7,
                'busy' => 0.0,
                default => 0.0,
            };

            $loadFactor = max(0, 1 - ($row['dayAppointmentsCount'] / 8)); // ajusta el "8" según tu realidad

            $row['score'] = round(
                $availabilityFactor * 0.7 +
                $loadFactor * 0.3,
                3
            );

            return $row;
        });

        $sorted = $employeesWithScore->sortByDesc('score')->values();
        $suggested = $sorted->first();

        return response()->json([
            'appointment' => [
                'id' => $appointment->appointmentId,
                'date' => $date,
                'time' => $time,
                'status' => $appointment->appointmentStatus,
            ],
            'suggestedEmployee' => $suggested,
            'employees' => $sorted,
        ]);
    }

    public function assign(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'employee_id' => ['required', 'exists:employees,employeeId'],
        ]);

        $employeeId = $data['employee_id'];

        $date = $appointment->appointmentDate;
        $time = substr($appointment->appointmentTime, 0, 5);

        // Verificar de nuevo que ese empleado no tenga cita a esa hora
        $citas = Booking::where('bookings.employeeIdFK', $employeeId)
            ->join('appointments', 'appointments.appointmentId', '=', 'bookings.appointmentIdFK')
            ->whereDate('appointments.appointmentDate', $date)
            ->select('appointments.appointmentTime', 'appointments.appointmentStatus')
            ->get();

        $ocupadoEnHora = $citas->contains(function ($c) use ($time) {
            return substr($c->appointmentTime, 0, 5) === $time
                && in_array($c->appointmentStatus, ['Scheduled', 'Pending confirmation']);
        });

        if ($ocupadoEnHora) {
            return response()->json([
                'message' => 'El empleado no está disponible en ese horario.',
            ], 422);
        }

        // Buscar la reserva (booking) de esta cita
        $booking = Booking::where('appointmentIdFK', $appointment->appointmentId)->first();

        if ($booking) {
            $booking->employeeIdFK = $employeeId;
            $booking->save();

            // 🔔 NOTIFICACIONES AQUÍ 🔔

            // 1) Notificar al empleado
            $employee = Employee::with('user')->find($employeeId);

            if ($employee && $employee->user) {
                $employee->user->notify(
                    new BookingAssignedToEmployee($booking)
                );
            }

            // 2) Notificar al cliente que ya tiene fotógrafo asignado
            $customer = null;
            if ($appointment->customerIdFK) {
                $customer = Customer::with('user')->find($appointment->customerIdFK);
            }

            if ($customer && $customer->user) {
                $customer->user->notify(
                    new PhotographerAssignedClient($booking)
                );
            }
        }

        // Opcional: actualizar estado de la cita
        $appointment->appointmentStatus = 'Scheduled';
        $appointment->save();

        return response()->json([
            'message' => 'Empleado asignado correctamente.',
            'appointmentId' => $appointment->appointmentId,
            'employeeId' => $employeeId,
        ]);
    }

    // public function assign(Request $request, Appointment $appointment)
    // {
    //     $data = $request->validate([
    //         'employee_id' => ['required', 'exists:employees,employeeId'],
    //     ]);

    //     $employeeId = $data['employee_id'];

    //     $date = $appointment->appointmentDate;
    //     $time = substr($appointment->appointmentTime, 0, 5);

    //     // Verificar de nuevo que ese empleado no tenga cita a esa hora
    //     $citas = Booking::where('employeeIdFK', $employeeId)
    //         ->join('appointments', 'appointments.appointmentId', '=', 'bookings.appointmentIdFK')
    //         ->whereDate('appointments.appointmentDate', $date)
    //         ->select('appointments.appointmentTime', 'appointments.appointmentStatus')
    //         ->get();

    //     $ocupadoEnHora = $citas->contains(function ($c) use ($time) {
    //         return substr($c->appointmentTime, 0, 5) === $time
    //             && in_array($c->appointmentStatus, ['Scheduled', 'Pending confirmation']);
    //     });

    //     if ($ocupadoEnHora) {
    //         return response()->json([
    //             'message' => 'El empleado no está disponible en ese horario.',
    //         ], 422);
    //     }

    //     // Buscar la reserva (booking) de esta cita
    //     $booking = Booking::where('appointmentIdFK', $appointment->appointmentId)->first();

    //     if ($booking) {
    //         $booking->employeeIdFK = $employeeId;
    //         $booking->save();
    //     }

    //     // Opcional: actualizar estado de la cita
    //     $appointment->appointmentStatus = 'Scheduled';
    //     $appointment->save();

    //     return response()->json([
    //         'message' => 'Empleado asignado correctamente.',
    //         'appointmentId' => $appointment->appointmentId,
    //         'employeeId' => $employeeId,
    //     ]);
    // }

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
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
