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
}
