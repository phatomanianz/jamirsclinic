<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */

    protected $hidden = [];

    protected $guarded = [];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'datetime' => 'date:m-d-Y h:i A',
        'created_at' => 'datetime:m-d-Y',
        'updated_at' => 'datetime:m-d-Y',
    ];

    public function personnel()
    {
        return $this->belongsTo(Personnel::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
