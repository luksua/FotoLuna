<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Listar clientes visibles para el usuario autenticado.
     *
     * - Si es empleado/fotógrafo: SOLO clientes que tengan booking con él.
     * - Si no es empleado (admin u otro): TODOS los clientes.
     * - Filtro opcional por año: ?year=2024
     */
    // empleados
    /**
     * Listar clientes visibles para el usuario autenticado.
     *
     * Regla:
     * - Empleado/Fotógrafo:
     *      - Clientes que tienen bookings con ese empleado
     *      - OR clientes cuyo created_by_user_id = id del usuario
     * - Admin/otros: todos los clientes
     *
     * Filtro opcional por año (?year=2025) usando created_at.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $year = $request->query('year');

        $query = Customer::query()
            ->with(['appointments.bookings.employee']); // asumiendo que ya tienes estas relaciones

        // 🔐 Empleado / fotógrafo: aplicar regla
        if ($user && $user->employee) {
            $employeeId = $user->employee->employeeId;

            $query->where(function ($q) use ($employeeId, $user) {
                // 1) Clientes que tienen booking con este empleado
                $q->whereHas('appointments.bookings', function ($sub) use ($employeeId) {
                    $sub->where('employeeIdFK', $employeeId);
                })
                    // 2) O clientes creados por este usuario
                    ->orWhere('created_by_user_id', $user->id);
            });
        }

        // 📅 Filtro por año (opcional)
        if ($year) {
            $query->whereYear('created_at', $year);
        }

        $customers = $query
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $customers->map(function (Customer $customer) use ($user) {
            $fullName = trim("{$customer->firstNameCustomer} {$customer->lastNameCustomer}");

            $hasAppointmentsForEmployee = false;
            $employeeModel = null;

            if ($user && $user->employee) {
                $employeeId = $user->employee->employeeId;

                // ¿Este cliente tiene alguna cita con este empleado?
                $hasAppointmentsForEmployee = $customer->appointments->contains(
                    function ($a) use ($employeeId) {
                        return $a->bookings->contains('employeeIdFK', $employeeId);
                    }
                );

                // Para el circulito, usamos el empleado logueado
                $employeeModel = $user->employee;
            } else {
                // Admin u otros: tomamos el empleado de la última cita (si existe)
                $lastAppointment = $customer->appointments
                    ->sortByDesc('appointmentDate')
                    ->first();
                $employeeModel = $lastAppointment?->bookings->first()?->employee;
                $hasAppointmentsForEmployee = $customer->appointments->isNotEmpty();
            }

            $employee = $employeeModel ? [
                'id' => $employeeModel->employeeId,
                'name' => trim("{$employeeModel->firstNameEmployee} {$employeeModel->lastNameEmployee}"),
                'photo_url' => $employeeModel->photoEmployee
                    ? asset('storage/' . ltrim($employeeModel->photoEmployee, '/'))
                    : null,
            ] : null;

            return [
                'id' => $customer->customerId,
                'fullName' => $fullName,
                'documentNumber' => $customer->documentNumber,
                'createdAt' => optional($customer->created_at)->toIso8601String(),
                'photoUrl' => $customer->photo_url,

                'employee' => $employee,

                // 👈 Lo usamos en React para el badge "Sin cita"
                'hasAppointments' => $hasAppointmentsForEmployee,
            ];
        })->values();

        return response()->json([
            'data' => $data,
        ]);
    }


    /**
     * Detalle de un cliente específico.
     *
     * - Empleado: solo puede ver clientes que tengan booking con él
     *   y se filtran las citas / bookings a ese empleado.
     * - Admin: ve toda la info del cliente.
     */
    /**
     * Devuelve todas las reservas (bookings) de un cliente específico.
     * Aplica una lógica de autorización similar al método `show`:
     * - Un empleado solo puede ver las reservas en las que está asignado o si creó al cliente.
     * - Un administrador puede ver todas las reservas del cliente.
     */
    public function bookings(Request $request, Customer $customer)
    {
        $user = $request->user();
        $eventId = $request->query('event_id');

        // --- Lógica de Autorización para Empleados ---
        if ($user && $user->employee) {
            $employeeId = $user->employee->employeeId;
            $isCreator = $customer->created_by_user_id === $user->id;

            // Verificamos si el empleado tiene CUALQUIER reserva con este cliente.
            $hasAnyBookings = $customer->appointments()
                ->whereHas('bookings', function ($q) use ($employeeId) {
                    $q->where('employeeIdFK', $employeeId);
                })->exists();

            // Si no es el creador y no tiene ninguna reserva, no está autorizado.
            if (!$isCreator && !$hasAnyBookings) {
                return response()->json(['message' => 'No está autorizado para ver las reservas de este cliente.'], 403);
            }
        }

        // --- Obtención y Filtrado de Datos ---
        $appointmentsQuery = $customer->appointments();

        // Si se pasa un event_id, filtramos las citas por ese evento.
        if ($eventId) {
            $appointmentsQuery->where('eventIdFK', $eventId);
        }

        // Para empleados, nos aseguramos de traer solo sus bookings en la consulta.
        if ($user && $user->employee) {
            $employeeId = $user->employee->employeeId;
            $appointmentsQuery->with(['bookings' => function ($q) use ($employeeId) {
                $q->where('employeeIdFK', $employeeId);
            }]);
        } else {
            // Para admin/otros, traemos todos los bookings.
            $appointmentsQuery->with('bookings');
        }

        $appointments = $appointmentsQuery->get();

        $filteredBookings = $appointments->flatMap(function ($appointment) {
            return $appointment->bookings;
        });

        // --- Respuesta ---
        // Si se filtró por evento y el resultado está vacío, devolvemos el mensaje específico.
        if ($eventId && $filteredBookings->isEmpty()) {
            return response()->json(['message' => 'No se encontraron reservas de este cliente para el evento especificado.'], 404);
        }

        // Devolvemos la lista de reservas (puede estar vacía si no hay, y eso es correcto).
        return response()->json($filteredBookings->values());
    }

    /**
     * Mostrar detalle de un cliente (datos, citas, sesiones, pagos).
     */
    public function show(Request $request, Customer $customer)
    {
        $user = $request->user();

        $customer->load([
            'documentType',
            'appointments.event',
            'appointments.bookings.employee',
            'appointments.bookings.package',
            'appointments.bookings.payments',
        ]);

        if ($user && $user->employee) {
            $employeeId = $user->employee->employeeId;
            $isCreator = $customer->created_by_user_id === $user->id;

            // Filtramos bookings a solo los del empleado actual
            $filteredAppointments = $customer->appointments->map(
                function ($a) use ($employeeId) {
                    $a->setRelation(
                        'bookings',
                        $a->bookings->where('employeeIdFK', $employeeId)->values()
                    );
                    return $a;
                }
            )->filter(function ($a) {
                return $a->bookings->isNotEmpty();
            })->values();

            // ⚠️ Si NO es creador y tampoco tiene citas con él → 403
            if (!$isCreator && $filteredAppointments->isEmpty()) {
                return response()->json([
                    'message' => 'No autorizado para ver este cliente',
                ], 403);
            }

            // Si es creador pero no tiene citas, appointments queda vacío y está bien
            $customer->setRelation('appointments', $filteredAppointments);
        }

        $fullName = trim("{$customer->firstNameCustomer} {$customer->lastNameCustomer}");

        // ---------------- Citas completas ----------------
        $appointments = $customer->appointments->map(function ($a) {
            return [
                'id' => $a->appointmentId,
                'date' => $a->appointmentDate,
                'time' => $a->appointmentTime,
                'place' => $a->place,
                'status' => $a->appointmentStatus,
                'comment' => $a->comment,
                'eventType' => $a->event?->eventType,
                'bookings' => $a->bookings->map(function ($b) {
                    $employee = $b->employee;
                    $package = $b->package;

                    $totalPayments = $b->payments->sum('amount');

                    return [
                        'id' => $b->bookingId,
                        'status' => $b->bookingStatus,
                        'sessionDate' => $b->sessionDate,
                        'employee' => $employee ? [
                            'id' => $employee->employeeId,
                            'name' => trim("{$employee->firstNameEmployee} {$employee->lastNameEmployee}"),
                        ] : null,
                        'package' => $package ? [
                            'id' => $package->packageId,
                            'name' => $package->packageName,
                            'price' => $package->price,
                        ] : null,
                        'totalPayments' => $totalPayments,
                    ];
                })->values(),
            ];
        })->values();

        // ---------------- Sesiones (bookings) “planas” ----------------
        $bookingsFlat = $appointments->flatMap(function ($a) {
            return collect($a['bookings'])->map(function ($b) use ($a) {
                return [
                    'id' => $b['id'],
                    'status' => $b['status'],
                    'date' => $a['date'],
                    'time' => $a['time'],
                    'eventType' => $a['eventType'],
                    'packageName' => $b['package']['name'] ?? null,
                    'packagePrice' => $b['package']['price'] ?? null,
                    'employee' => $b['employee']['name'] ?? null,
                    'totalPaid' => $b['totalPayments'],
                ];
            });
        })->values();

        // ---------------- Pagos “planos” ----------------
        $paymentsFlat = $customer->appointments->flatMap(function ($a) {
            return $a->bookings->flatMap(function ($b) {
                return $b->payments->map(function ($p) use ($b) {
                    return [
                        'id' => $p->paymentId,
                        'bookingId' => $b->bookingId,
                        'amount' => $p->amount,
                        'method' => $p->paymentMethod,
                        'status' => $p->paymentStatus,
                        'paidAt' => $p->created_at,
                    ];
                });
            });
        })->values();

        return response()->json([
            'id' => $customer->customerId,
            'fullName' => $fullName,
            'documentNumber' => $customer->documentNumber,
            'documentType' => $customer->documentType->documentTypeName ?? null,
            'phone' => $customer->phoneCustomer,
            'email' => $customer->emailCustomer,
            'photoUrl' => $customer->photo_url,

            'appointments' => $appointments,
            'bookings' => $bookingsFlat,
            'payments' => $paymentsFlat,
        ]);
    }

    // 👇 Todo lo demás lo dejamos vacío como estaba

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    public function edit(Customer $customer)
    {
        //
    }

    public function update(Request $request, Customer $customer)
    {
        //
    }

    public function destroy(Customer $customer)
    {
        //
    }

    public function search(Request $request)
    {
        $query = $request->query('query');
        $user = $request->user();

        // 1. Verificación mínima de la consulta
        if (!$query || strlen($query) < 2) {
            // Devuelve un array vacío si la consulta es muy corta
            return response()->json([]);
        }

        $customers = Customer::query()
            // Buscar en las columnas de nombre y documento
            ->where(function ($q) use ($query) {
                $q->where('firstNameCustomer', 'LIKE', "%{$query}%")
                    ->orWhere('lastNameCustomer', 'LIKE', "%{$query}%")
                    ->orWhere('documentNumber', 'LIKE', "%{$query}%");
            });

        // 2. 🔐 Regla de Seguridad: Filtrar clientes por empleado
        if ($user && $user->employee) {
            $employeeId = $user->employee->employeeId;

            $customers->where(function ($q) use ($employeeId, $user) {
                // Clientes asociados por booking con este empleado
                $q->whereHas('appointments.bookings', function ($sub) use ($employeeId) {
                    $sub->where('employeeIdFK', $employeeId);
                })
                    // O clientes que fueron creados por este usuario
                    ->orWhere('created_by_user_id', $user->id);
            });
        }

        $results = $customers
            ->limit(10) // Limitar resultados para autocompletado
            ->get(['customerId', 'firstNameCustomer', 'lastNameCustomer', 'documentNumber'])
            ->map(function (Customer $customer) {
                // 3. Formatear la salida para el Frontend (ID y Nombre completo)
                $fullName = trim("{$customer->firstNameCustomer} {$customer->lastNameCustomer}");

                return [
                    'id' => $customer->customerId,
                    'name' => $fullName,
                    'documentNumber' => $customer->documentNumber,
                ];
            })->values();

        return response()->json($results);
    }
}
