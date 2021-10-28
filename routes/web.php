<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/{path}', function () {
  $setting = App\Setting::oldest()->first();
  config(['app.name' => $setting->title ?? 'CRMS']);
  return view('app');
})->where('path', '.*');

// Route::get('/', function () {
//   return view('app');
// });

// Auth::routes(['register' => false]);

// Route::get('/home', 'HomeController@index')->name('home');
