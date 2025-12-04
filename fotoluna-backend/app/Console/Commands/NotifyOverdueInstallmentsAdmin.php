<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BookingPaymentInstallment;
use App\Models\User;
use App\Notifications\OverdueInstallmentsAdmin;

class NotifyOverdueInstallmentsAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * php artisan installments:notify-overdue-admin
     */
    protected $signature = 'installments:notify-overdue-admin';

    /**
     * The console command description.
     */
    protected $description = 'Notifica a los administradores sobre reservas con cuotas vencidas';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Buscando cuotas vencidas...');

        $today = now()->toDateString();

        // Cuotas vencidas: due_date < hoy y estado pendiente / overdue
        $installments = BookingPaymentInstallment::query()
            ->whereIn('status', ['pending', 'overdue'])
            ->whereDate('due_date', '<', $today)
            ->whereHas('booking', function ($q) {
                // opcional: ignorar reservas canceladas
                $q->where('bookingStatus', '!=', 'Cancelled');
            })
            ->get();

        if ($installments->isEmpty()) {
            $this->info('No hay cuotas vencidas. Nada que notificar.');
            return self::SUCCESS;
        }

        $bookingsCount     = $installments->groupBy('bookingIdFK')->count();
        $installmentsCount = $installments->count();

        $this->info("Encontradas {$installmentsCount} cuotas vencidas en {$bookingsCount} reservas.");

        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            $this->warn('No se encontraron usuarios admin para notificar.');
            return self::SUCCESS;
        }

        foreach ($admins as $admin) {
            $admin->notify(
                new OverdueInstallmentsAdmin($bookingsCount, $installmentsCount)
            );
        }

        $this->info('✅ Notificaciones de pagos vencidos enviadas a administradores.');

        return self::SUCCESS;
    }
}
