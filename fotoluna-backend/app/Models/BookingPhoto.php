<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingPhoto extends Model
{
    use HasFactory;

    protected $primaryKey = 'photoId';

    protected $fillable = [
        'bookingIdFK',
        'photoPath',
        'photoDescription',
        'employeeIdFK',
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
        public function booking()
    {
        return $this->belongsTo(Booking::class, 'bookingIdFK', 'bookingId');
    }
}
