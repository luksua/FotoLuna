<?php

namespace App\Events;

use App\Models\Customer;
use App\Models\Employee;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CustomerCreated
{
    use Dispatchable, SerializesModels;

    public $employee;
    public $customer;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Employee $employee, Customer $customer)
    {
        $this->employee = $employee;
        $this->customer = $customer;
    }
}
