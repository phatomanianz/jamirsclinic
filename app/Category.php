<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
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
    ];

    public function treatments()
    {
        return $this->hasMany(Treatment::class);
    }
}
