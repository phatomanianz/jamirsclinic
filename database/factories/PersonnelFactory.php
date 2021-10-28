<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Personnel;
use Faker\Generator as Faker;

$factory->define(Personnel::class, function (Faker $faker) {
    return [
        'name' => $faker->unique()->name,
        'address' => $faker->address,
        'phone' => $faker->e164PhoneNumber,
        'image' => 'users/default/user.png'
    ];
});
