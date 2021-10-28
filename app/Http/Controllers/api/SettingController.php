<?php

namespace App\Http\Controllers\api;

use App\Setting;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $setting = Setting::oldest()->first();
        if (isset($setting->logo)) {
            $setting->logo = asset('/storage/' . $setting->logo);
        }

        return response()->json([
            'setting' => $setting
        ]);
    }

    public function update($setting)
    {
        $data = request()->validate([
            'name' => ['bail', 'required', 'string', 'max:255'],
            'title' => ['bail', 'required', 'string', 'max:255'],
            'address' => ['bail', 'required', 'string', 'max:255'],
            'phone' => ['bail', 'required', 'string', 'max:255'],
            'email' => ['bail', 'required', 'string', 'email', 'max:255'],
            'currency' => ['bail', 'required', 'string', 'max:255'],
            'logo' => ['image', 'nullable']
        ]);

        $setting = Setting::where('id', $setting)->oldest()->first();

        if ($setting) {
            if (isset($data['logo'])) {
                Storage::delete('/public/' . $setting->logo);
                $data['logo'] = $data['logo']->store('settings/logo', 'public');
            }

            $setting->update($data);
        } else {
            Setting::create($data);
        }

        return response()->json([
            'setting' => $setting
        ]);
    }
}
