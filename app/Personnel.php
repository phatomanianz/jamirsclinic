<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Personnel extends Model
{
    use SoftDeletes;

    /* The attributes that should be hidden for arrays.
    *
    * @var array
    */
    protected $hidden = ['deleted_at'];

    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'account_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoices::class);
    }
}
