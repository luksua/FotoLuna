<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Support\Collection;

class ScheduleConflictEmployee extends Notification
{
    use Queueable;

    /**
     * @param  \App\Models\Booking  $booking  La reserva “nueva” o actual
     * @param  \Illuminate\Support\Collection  $conflictingBookings  Otras reservas que chocan (Collection<Booking>)
     */
    public function __construct(
        public Booking $booking,
        public Collection $conflictingBookings
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable): array
    {
        $booking     = $this->booking;
        $appointment = $booking->appointment;
        $employeeId  = $booking->employeeIdFK;

        $date = \Carbon\Carbon::parse($appointment->appointmentDate)
            ->format('d/m/Y');

        // Lista de horarios en conflicto, ej: ["15:00", "16:30"]
        $conflictingTimes = $this->conflictingBookings
            ->map(function (Booking $b) {
                $appt = $b->appointment;
                return [
                    'booking_id'       => $b->bookingId,
                    'appointment_id'   => $appt?->appointmentId,
                    'time'             => $appt ? substr($appt->appointmentTime, 0, 5) : null,
                    'duration_minutes' => $appt?->appointmentDuration,
                ];
            })
            ->values()
            ->all();

        $message = sprintf(
            'Tienes posibles conflictos de agenda el %s. Revisa tus horarios: esta sesión y %d más están muy cercanas entre sí.',
            $date,
            count($conflictingTimes)
        );

        return [
            'type'                 => 'employee.schedule_conflict',
            'title'                => 'Posible conflicto de agenda',
            'message'              => $message,

            'booking_id'           => $booking->bookingId,
            'appointment_id'       => $appointment->appointmentId,
            'employee_id'          => $employeeId,

            // Info para que el front pueda mostrar detalles si quieres
            'date'                 => $appointment->appointmentDate,
            'time'                 => substr($appointment->appointmentTime, 0, 5),
            'duration_minutes'     => $appointment->appointmentDuration,
            'conflicting_bookings' => $conflictingTimes,

            'status'               => $booking->bookingStatus,
            'priority'             => 'high',
            'icon'                 => 'bi bi-exclamation-triangle',
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id'   => $this->id,
            'data' => $this->toDatabase($notifiable),
        ]);
    }

    public function toArray($notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
