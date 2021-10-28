<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        factory(App\User::class, 1)->create()->each(function ($user) {
            $user->personnel()->save(factory(App\Personnel::class)->make());
        });

        // factory(App\User::class, 50)->create()->each(function ($user) {
        //     $user->patient()->save(factory(App\Patient::class)->make());
        // });
    }
}
