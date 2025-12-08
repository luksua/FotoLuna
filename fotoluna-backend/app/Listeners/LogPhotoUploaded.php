<?php

namespace App\Listeners;

use App\Events\PhotoUploaded;
use App\Models\EmployeeAction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;

class LogPhotoUploaded
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
     * @param  \App\Events\PhotoUploaded  $event
     * @return void
     */
    public function handle(PhotoUploaded $event)
    {
        EmployeeAction::create([
            'employee_id' => $event->employee->employeeId,
            'user_id' => Auth::id(),
            'action_type' => 'PHOTO_UPLOAD',
            'details' => json_encode([
                'photo_id' => $event->photo->id,
                'customer_id' => $event->photo->customer_id,
            ])
        ]);
    }
}
