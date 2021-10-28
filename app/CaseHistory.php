<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CaseHistory extends Model
{
    protected $guarded = [];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'date' => 'date:m-d-Y',
        'created_at' => 'datetime:m-d-Y',
        'updated_at' => 'datetime:m-d-Y',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
