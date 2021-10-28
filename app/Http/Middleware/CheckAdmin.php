<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class CheckAdmin
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
        if (Auth::user()->role === "admin") {
            return $next($request);
        }

        return response()->json([
            "success" => false,
            "message" => "You are not authorized to access the resource"
        ], 401);
    }
}
