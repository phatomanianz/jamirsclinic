<?php

namespace App\Listeners;

use App\Events\PatientDeleted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Storage;

class HandlePatientDeleted
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
     * @param  PatientDeleted  $event
     * @return void
     */
    public function handle(PatientDeleted $event)
    {
        foreach ($event->patient->documents as $document) {
            Storage::delete('/public/' . $document->file);
        }
        $event->patient->documents()->delete();
    }
}
