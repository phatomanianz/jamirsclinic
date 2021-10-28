<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $guarded = [];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'expiration_date' => 'date:m-d-Y',
        'created_at' => 'datetime:m-d-Y g:i A',
        'updated_at' => 'datetime:m-d-Y g:i A',
    ];

    public function treatment()
    {
        return $this->belongsTo(Treatment::class);
    }
}
