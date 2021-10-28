<?php

namespace App\Http\Middleware;

use Closure;

class CheckNotPatient
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (auth()->user()->role !== "patient") {
            return $next($request);
        }

        return response()->json([
            "success" => false,
            "message" => "You are not authorized to access the resource"
        ]);
    }
}
