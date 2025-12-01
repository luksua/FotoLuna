<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $primaryKey = 'bookingId';

    protected $fillable = [
        'appointmentIdFK',
        'packageIdFK',
        'employeeIdFK',
        'bookingStatus',
        'documentTypeIdFK',
    ];

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class, 'documentTypeIdFK');
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointmentIdFK', 'appointmentId');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'packageIdFK', 'packageId');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employeeIdFK', 'employeeId');
    }

    public function photographer()
    {
        // asumiendo que employeeIdFK apunta a employees.employeeId
        return $this->belongsTo(Employee::class, 'employeeIdFK', 'employeeId');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'bookingIdFK', 'bookingId');
    }

    public function installments()
    {
        return $this->hasMany(BookingPaymentInstallment::class, 'bookingIdFK', 'bookingId');
    }
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerIdFK', 'customerId');
    }

    public function event()
    {
        return $this->belongsTo(Event::class, 'eventIdFK', 'eventId');
    }
    public function photos()
    {
        // booking_photos.bookingIdFK → bookings.bookingId
        return $this->hasMany(BookingPhoto::class, 'bookingIdFK', 'bookingId');
    }
    public function cloudPhotos()
    {
        return $this->hasMany(CloudPhoto::class, 'bookingIdFK', 'bookingId');
    }
}
