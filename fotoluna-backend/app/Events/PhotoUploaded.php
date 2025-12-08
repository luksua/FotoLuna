<?php

namespace App\Events;

use App\Models\Employee;
use App\Models\CloudPhoto;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PhotoUploaded
{
    use Dispatchable, SerializesModels;

    public $employee;
    public $photo;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Employee $employee, CloudPhoto $photo)
    {
        $this->employee = $employee;
        $this->photo = $photo;
    }
}
