<?php

namespace App\Events;

use App\Models\Appointment;
use App\Models\Employee;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentUpdatedByEmployee
{
    use Dispatchable, SerializesModels;

    public $employee;
    public $appointment;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Employee $employee, Appointment $appointment)
    {
        $this->employee = $employee;
        $this->appointment = $appointment;
    }
}
