<?php

namespace App\Events;

use App\Models\Booking;
use App\Models\Employee;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingAssignedToEmployee
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $booking;
    public $employee;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\Booking $booking
     * @param \App\Models\Employee $employee
     * @return void
     */
    public function __construct(Booking $booking, Employee $employee)
    {
        $this->booking = $booking;
        $this->employee = $employee;
    }
}
