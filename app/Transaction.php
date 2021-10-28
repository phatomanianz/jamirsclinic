<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
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

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function treatment()
    {
        return $this->belongsTo(Treatment::class);
    }
}
