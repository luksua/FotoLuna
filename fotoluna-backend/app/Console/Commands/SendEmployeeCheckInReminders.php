<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\Employee;
use App\Notifications\EmployeeCheckInReminder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendEmployeeCheckInReminders extends Command
{
    protected $signature = 'appointments:employee-checkin';

    protected $description = 'Envía recordatorios de check-in (30 minutos antes) a los fotógrafos asignados.';

    public function handle(): int
{
    $now = now();

    // Ventana objetivo: entre 29 y 31 minutos en el futuro
    $windowStart = $now->copy()->addMinutes(29);
    $windowEnd   = $now->copy()->addMinutes(31);

    $this->info('🔍 Buscando sesiones para recordatorio de check-in...');
    $this->info("Ventana: {$windowStart->format('Y-m-d H:i:s')} - {$windowEnd->format('Y-m-d H:i:s')}");

    $bookings = Booking::with(['appointment', 'employee.user', 'appointment.customer'])
        ->whereNotNull('employeeIdFK')
        ->whereIn('bookingStatus', ['Confirmed', 'Completed']) // si quieres, deja solo ['Confirmed']
        ->whereHas('appointment', function ($q) use ($windowStart, $windowEnd) {
            $q->whereBetween(
                DB::raw("CONCAT(appointmentDate, ' ', appointmentTime)"),
                [
                    $windowStart->format('Y-m-d H:i:s'),
                    $windowEnd->format('Y-m-d H:i:s'),
                ]
            );
        })
        ->get();

    if ($bookings->isEmpty()) {
        $this->info('No hay sesiones que requieran recordatorio ahora.');
        return self::SUCCESS;
    }

    foreach ($bookings as $booking) {
        $employee = $booking->employee;

        if (!$employee || !$employee->user) {
            $this->warn("La reserva {$booking->bookingId} no tiene empleado con usuario asociado.");
            continue;
        }

        $employee->user->notify(
            new EmployeeCheckInReminder($booking)
        );

        $this->info(
            "✅ Recordatorio enviado al empleado #{$employee->employeeId} ".
            "para booking #{$booking->bookingId}"
        );
    }

    $this->info('✔ Proceso de recordatorios de check-in completado.');

    return self::SUCCESS;
}
}
