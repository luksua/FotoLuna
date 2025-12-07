<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use Carbon\Carbon;

class CleanOldAppointments extends Command
{
    /**
     * Nombre y firma del comando en consola.
     *
     * php artisan appointments:cleanup
     */
    protected $signature = 'appointments:cleanup';

    /**
     * Descripción del comando.
     */
    protected $description = 'Limpia citas en borrador y en pago pendiente que llevan demasiado tiempo sin completarse';

    /**
     * Ejecuta el comando.
     */
    public function handle(): int
    {
        $this->info('Iniciando limpieza de citas...');

        $now = Carbon::now();

        // 🔹 1) Eliminar citas en draft con más de 24h
        $draftLimit = $now->copy()->subHours(24);

        $drafts = Appointment::where('appointmentStatus', 'draft')
            ->where('created_at', '<', $draftLimit)
            ->get();

        $this->info('Citas en draft a eliminar: ' . $drafts->count());

        foreach ($drafts as $appointment) {
            // Eliminar bookings relacionados por si acaso
            $countBookings = $appointment->bookings()->count();
            if ($countBookings > 0) {
                $this->info(" - Appointment #{$appointment->appointmentId} tiene {$countBookings} bookings asociados. Eliminando bookings...");
                $appointment->bookings()->delete();
            }

            $this->info(" - Eliminando appointment draft #{$appointment->appointmentId}");
            $appointment->delete();
        }

        // 🔹 2) Eliminar citas en pending_payment con más de 2h
        $pendingLimit = $now->copy()->subHours(2);

        $pendings = Appointment::where('appointmentStatus', 'pending_payment')
            ->where('updated_at', '<', $pendingLimit)
            ->get();

        $this->info('Citas en pending_payment a limpiar: ' . $pendings->count());

        foreach ($pendings as $appointment) {
            $countBookings = $appointment->bookings()->count();
            if ($countBookings > 0) {
                $this->info(" - Appointment #{$appointment->appointmentId} (pending_payment) tiene {$countBookings} bookings. Eliminando bookings...");
                $appointment->bookings()->delete();
            }

            $this->info(" - Eliminando appointment pending_payment #{$appointment->appointmentId}");
            $appointment->delete();
        }

        $this->info('Limpieza de citas completada.');

        return self::SUCCESS;
    }
}
