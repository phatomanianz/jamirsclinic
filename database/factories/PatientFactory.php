<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Patient;
use Faker\Generator as Faker;

$factory->define(Patient::class, function (Faker $faker) {
    return [
        'name' => $faker->unique()->name,
        'address' => $faker->address,
        'phone' => $faker->e164PhoneNumber,
        'sex' => 'male',
        'birthdate' => $faker->date($format = 'Y-m-d', $max = 'now'),
        'image' => 'patients/default/patient.png'
    ];
});
