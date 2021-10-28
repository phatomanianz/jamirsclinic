<?php

namespace App;

use App\Events\PatientDeleted;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $guarded = [];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime:m-d-Y',
        'updated_at' => 'datetime:m-d-Y',
        'birthdate' => 'datetime:m-d-Y',
    ];

    /**
     * The event map for the model.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'deleted' => PatientDeleted::class
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'account_id');
    }

    public function histories()
    {
        return $this->hasMany(CaseHistory::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
