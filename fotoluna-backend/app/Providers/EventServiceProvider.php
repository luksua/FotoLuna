<?php

namespace App\Providers;

use App\Events\AppointmentUpdatedByEmployee;
use App\Events\BookingAssignedToEmployee;
use App\Events\CustomerCreated;
use App\Events\EmployeeAvailabilityUpdated;
use App\Events\EmployeeCreated;
use App\Events\EmployeeUpdated;
use App\Events\PhotoUploaded;
use App\Listeners\LogAppointmentUpdatedByEmployee;
use App\Listeners\LogCustomerCreated;
use App\Listeners\LogEmployeeAction;
use App\Listeners\LogEmployeeAvailabilityUpdated;
use App\Listeners\LogEmployeeCreated;
use App\Listeners\LogEmployeeUpdated;
use App\Listeners\LogPhotoUploaded;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        BookingAssignedToEmployee::class => [
            LogEmployeeAction::class,
        ],
        PhotoUploaded::class => [
            LogPhotoUploaded::class,
        ],
        AppointmentUpdatedByEmployee::class => [
            LogAppointmentUpdatedByEmployee::class,
        ],
        CustomerCreated::class => [
            LogCustomerCreated::class,
        ],
        EmployeeCreated::class => [
            LogEmployeeCreated::class,
        ],
        EmployeeAvailabilityUpdated::class => [
            LogEmployeeAvailabilityUpdated::class,
        ],
        EmployeeUpdated::class => [
            LogEmployeeUpdated::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
