<?php

namespace App\Listeners;

use App\Events\CustomerCreated;
use App\Models\EmployeeAction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;

class LogCustomerCreated
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
     * @param  \App\Events\CustomerCreated  $event
     * @return void
     */
    public function handle(CustomerCreated $event)
    {
        EmployeeAction::create([
            'employee_id' => $event->employee->employeeId,
            'user_id' => Auth::id(),
            'action_type' => 'CUSTOMER_CREATED',
            'details' => json_encode([
                'customer_id' => $event->customer->customerId,
            ])
        ]);
    }
}
