<?php

namespace App\Console\Commands;

use App\Models\BookingPaymentInstallment;
use App\Notifications\InstallmentDueSoonClient;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendDueInstallmentNotifications extends Command
{
    protected $signature = 'installments:due-reminders';
    protected $description = 'Enviar notificaciones a clientes cuando una cuota está por vencer';

    public function handle()
    {
        // hoy + 1 día (ajusta a tu gusto: hoy, 2 días, 3 días, etc.)
        $targetDate = Carbon::now()->addDay()->toDateString();

        $installments = BookingPaymentInstallment::where('status', 'pending')
            ->whereDate('due_date', $targetDate)
            ->with([
                'booking.appointment.customer.user'
            ])
            ->get();

        foreach ($installments as $installment) {
            $booking    = $installment->booking;
            $appointment= $booking?->appointment;
            $customer   = $appointment?->customer;
            $user       = $customer?->user;

            if (!$user) {
                continue; // por si falta el vínculo
            }

            // Aquí podrías tener un campo "due_soon_notified" para no repetir noti
            // if ($installment->due_soon_notified) continue;

            $user->notify(new InstallmentDueSoonClient(
                installment: $installment,
                booking:     $booking,
                dueDate:     $installment->due_date,
                amount:      $installment->amount,
            ));

            // Marca como notificado si agregas una columna
            // $installment->update(['due_soon_notified' => true]);
        }

        $this->info('Notificaciones de cuotas por vencer enviadas.');
        return 0;
    }
}
