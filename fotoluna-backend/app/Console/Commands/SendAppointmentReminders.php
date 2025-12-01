<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Notifications\AppointmentReminderClient;
use Illuminate\Console\Command;

class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders';
    protected $description = 'Enviar recordatorios 1 semana y 1 día antes de la cita al cliente';

    public function handle(): int
    {
        // ⚠️ Revisa que tu timezone en config/app.php sea correcto
        $today       = now()->toDateString();
        $oneWeekDate = now()->addWeek()->toDateString(); // hoy + 7
        $oneDayDate  = now()->addDay()->toDateString();  // hoy + 1

        $this->info("Hoy es: {$today}");
        $this->info("Recordatorios semana para fecha: {$oneWeekDate}");
        $this->info("Recordatorios día para fecha: {$oneDayDate}");

        $baseQuery = Appointment::query()
            ->where('appointmentStatus', 'Scheduled')
            ->with(['customer.user']);

        // 🔔 1 SEMANA ANTES
        $weekAppointments = (clone $baseQuery)
            ->whereDate('appointmentDate', $oneWeekDate)
            ->get();

        $this->info('Citas para recordatorio de 1 semana: '.$weekAppointments->count());

        foreach ($weekAppointments as $appointment) {
            $user = $appointment->customer?->user;
            if (!$user) {
                $this->warn("Cita {$appointment->appointmentId} no tiene user asociado.");
                continue;
            }

            $user->notify(
                new AppointmentReminderClient($appointment, 'week')
            );

            $this->info("➡ Enviado recordatorio SEMANA a user #{$user->id} (cita {$appointment->appointmentId})");
        }

        // 🔔 1 DÍA ANTES
        $dayAppointments = (clone $baseQuery)
            ->whereDate('appointmentDate', $oneDayDate)
            ->get();

        $this->info('Citas para recordatorio de 1 día: '.$dayAppointments->count());

        foreach ($dayAppointments as $appointment) {
            $user = $appointment->customer?->user;
            if (!$user) {
                $this->warn("Cita {$appointment->appointmentId} no tiene user asociado.");
                continue;
            }

            $user->notify(
                new AppointmentReminderClient($appointment, 'day')
            );

            $this->info("➡ Enviado recordatorio DÍA a user #{$user->id} (cita {$appointment->appointmentId})");
        }

        $this->info('✅ Recordatorios procesados.');

        return Command::SUCCESS;
    }
}
