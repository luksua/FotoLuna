<?php

namespace App\Listeners;

use App\Events\BookingAssignedToEmployee;
use App\Models\EmployeeAction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;

class LogEmployeeAction
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(BookingAssignedToEmployee $event): void
    {
        EmployeeAction::create([
            'employee_id' => $event->employee->id,
            'user_id' => Auth::id(), // ID of the admin who assigned the booking
            'action_type' => 'BOOKING_ASSIGNED',
            'details' => json_encode([
                'booking_id' => $event->booking->id,
                'event_date' => $event->booking->event_date,
                'customer_name' => $event->booking->customer->name,
            ])
        ]);
    }
}
