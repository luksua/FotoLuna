<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\User;
use App\Notifications\LatePhotoDeliveryAdmin;
use Carbon\Carbon;
use Illuminate\Console\Command;


class CheckLatePhotoDelivery extends Command
{
    protected $signature = 'photos:check-sla';
    protected $description = 'Notifica a los admins sobre sesiones con fotos sin entregar fuera del SLA';

    public function handle()
    {
        $this->info('🔍 Buscando sesiones con entrega de fotos atrasada (SLA)...');

        // Días de SLA (por ejemplo 7). Luego lo puedes mover a config si quieres.
        $slaDays = 7;

        $today = Carbon::today();

        $bookings = Booking::query()
            // Solo reservas completadas
            ->where('bookingStatus', 'Completed')
            // La fecha de la sesión fue hace más de X días
            ->whereHas('appointment', function ($q) use ($slaDays, $today) {
                $q->whereDate(
                    'appointmentDate',
                    '<',
                    $today->copy()->subDays($slaDays)->toDateString()
                );
            })
            // Tiene plan de almacenamiento asociado (SLA aplica a nube)
            ->whereHas('storageSubscriptions', function ($q) {
                $q->where('status', 'active');
            })
            // Y NO tiene fotos subidas a la nube
            ->whereDoesntHave('cloudPhotos')
            ->with(['appointment.customer', 'employee'])
            ->get();

        if ($bookings->isEmpty()) {
            $this->info('✔ No hay sesiones atrasadas según el SLA.');
            return self::SUCCESS;
        }

        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            $this->warn('⚠ No hay usuarios admin para notificar.');
            return self::SUCCESS;
        }

        foreach ($bookings as $booking) {
            $appointment = $booking->appointment;
            if (!$appointment) {
                continue;
            }

            $deadline = Carbon::parse($appointment->appointmentDate)->addDays($slaDays);

            foreach ($admins as $admin) {
                $admin->notify(new LatePhotoDeliveryAdmin($booking, $deadline));
            }

            $this->line(
                sprintf(
                    '• Notificada sesión #%d (fecha %s) por retraso en entrega de fotos.',
                    $booking->bookingId,
                    $appointment->appointmentDate
                )
            );
        }

        $this->info('✔ Proceso de notificación por SLA completado.');

        return self::SUCCESS;
    }
}
