<?php

namespace App\Listeners;

use App\Events\EmployeeAvailabilityUpdated;
use App\Models\EmployeeAction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;

class LogEmployeeAvailabilityUpdated
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
     * @param  \App\Events\EmployeeAvailabilityUpdated  $event
     * @return void
     */
    public function handle(EmployeeAvailabilityUpdated $event)
    {
        EmployeeAction::create([
            'employee_id' => $event->employee->employeeId,
            'user_id' => Auth::id(),
            'action_type' => 'EMPLOYEE_AVAILABILITY_UPDATED',
            'details' => json_encode([
                'employee_id' => $event->employee->employeeId,
                'is_available' => $event->employee->isAvailable,
            ])
        ]);
    }
}
