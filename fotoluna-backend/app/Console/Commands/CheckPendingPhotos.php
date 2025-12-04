<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;
use App\Notifications\PendingPhotosEmployee;
use App\Notifications\Admin\PendingPhotosAdmin;

class CheckPendingPhotos extends Command
{
    protected $signature = 'photos:check-pending';
    protected $description = 'Notifica a los empleados cuando hay fotos pendientes de entrega';

public function handle(): int
{
    $this->info('🔍 Buscando sesiones con fotos pendientes...');

    $today = now()->toDateString();

    $bookings = Booking::query()
        ->where('bookingStatus', 'Completed')      // sesión ya realizada
        ->whereNotNull('employeeIdFK')             // con fotógrafo asignado
        ->whereHas('appointment', function ($q) use ($today) {
            $q->where('appointmentDate', '<=', $today); // la fecha ya pasó
        })
        ->whereDoesntHave('cloudPhotos')           // 👈 no hay fotos en la nube
        ->with(['cloudPhotos', 'employee.user', 'appointment', 'customer'])
        ->get();

    if ($bookings->isEmpty()) {
        $this->info('✔ No hay sesiones con fotos pendientes.');
        return self::SUCCESS;
    }

    foreach ($bookings as $booking) {
        $employeeUser = $booking->employee?->user;

        if (! $employeeUser) {
            $this->warn("⚠ La reserva {$booking->bookingId} no tiene empleado asignado.");
            continue;
        }

        $employeeUser->notify(new PendingPhotosEmployee($booking));

        $this->info("📨 Notificación enviada al empleado de booking {$booking->bookingId}");
    }

    $this->info('✔ Proceso completado.');

    return self::SUCCESS;
}

}
