<?php

namespace App\Listeners;

use App\Events\AppointmentUpdatedByEmployee;
use App\Models\EmployeeAction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;

class LogAppointmentUpdatedByEmployee
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  \App\Events\AppointmentUpdatedByEmployee  $event
     * @return void
     */
    public function handle(AppointmentUpdatedByEmployee $event)
    {
        EmployeeAction::create([
            'employee_id' => $event->employee->employeeId,
            'user_id' => Auth::id(),
            'action_type' => 'APPOINTMENT_UPDATE',
            'details' => json_encode([
                'appointment_id' => $event->appointment->appointmentId,
                'customer_id' => $event->appointment->customerIdFK,
            ])
        ]);
    }
}
