<?php

namespace App\Listeners;

use App\Events\EmployeeCreated;
use App\Models\EmployeeAction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;

class LogEmployeeCreated
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
     * @param  \App\Events\EmployeeCreated  $event
     * @return void
     */
    public function handle(EmployeeCreated $event)
    {
        EmployeeAction::create([
            'employee_id' => $event->employee->employeeId,
            'user_id' => Auth::id(),
            'action_type' => 'EMPLOYEE_CREATED',
            'details' => json_encode([
                'employee_id' => $event->employee->employeeId,
            ])
        ]);
    }
}
