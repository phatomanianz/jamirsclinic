<?php

namespace App\Listeners;

use App\Events\UserRestored;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HandleUserRestored
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  UserRestored  $event
     * @return void
     */
    public function handle(UserRestored $event)
    {
        if ($event->user->role !== 'patient') {
            $event->user->personnel()->withTrashed()->restore();
        }
    }
}
