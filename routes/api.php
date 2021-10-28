<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });


// Users
Route::post('/user/login', 'api\UsersController@login');
Route::group(['middleware' => ['auth:api']], function () {
  Route::post('/user/logout', 'api\UsersController@logout');
  Route::get('/user/validate-token', 'api\UsersController@validateToken');
  Route::patch('/user/profile', 'api\UsersController@updateProfile');
});
Route::group(['middleware' => ['auth:api', 'admin']], function () {
  Route::post('/user/register', 'api\UsersController@register');
  Route::get('/user', 'api\UsersController@index');
  Route::get('/user/{personnel}', 'api\UsersController@show');
  Route::patch('/user/{personnel}', 'api\UsersController@update');
  Route::delete('/user/{personnel}', 'api\UsersController@destroy');
});

// Personnel
Route::group(['middleware' => ['auth:api', '!patient']], function () {
  Route::get('/personnels', 'api\PersonnelController@index');
  Route::get('/personnels/doctors', 'api\PersonnelController@doctors');
  Route::get('/personnels/doctors/{doctor}/appointments', 'api\PersonnelController@doctorAppointments');
  Route::get('/personnels/doctors/{doctor}/prescriptions', 'api\PersonnelController@doctorPrescriptions');
});

// Patient's History
Route::group(['middleware' => ['auth:api']], function () {
  Route::get('/patients/{patient}/histories/show', 'api\PatientController@histories');
  Route::get('/patients/{patient}/prescriptions/show', 'api\PatientController@prescriptions');
  Route::get('/patients/{patient}/documents/show', 'api\PatientController@documents');
  Route::get('/patients/{patient}/appointments/show', 'api\PatientController@appointments');
  Route::get('/patients/{patient}/invoices/show', 'api\PatientController@invoices');
});

// Patients
Route::group(['middleware' => ['auth:api']], function () {
  Route::get('/patients/{patient}', 'api\PatientController@show');
});
Route::group(['middleware' => ['auth:api', '!patient']], function () {
  Route::get('/patients', 'api\PatientController@index');
  Route::post('/patients', 'api\PatientController@store');
  Route::patch('/patients/{patient}', 'api\PatientController@update');
});
Route::group(['middleware' => ['auth:api', '!doctor', '!receptionist', '!patient']], function () {
  Route::delete('/patients/{patient}', 'api\PatientController@destroy');
});

// Documents
Route::group(['middleware' => ['auth:api']], function () {
  Route::get('/documents', 'api\DocumentController@index');
  Route::get('/documents/{document}', 'api\DocumentController@show');
});
Route::group(['middleware' => ['auth:api', '!patient']], function () {
  Route::post('/documents', 'api\DocumentController@store');
  Route::patch('/documents/{document}', 'api\DocumentController@update');
  Route::delete('/documents/{document}', 'api\DocumentController@destroy');
});

// Case Histories
Route::group(['middleware' => ['auth:api']], function () {
  Route::get('/casehistories', 'api\CaseHistoryController@index');
  Route::get('/casehistories/{caseHistory}', 'api\CaseHistoryController@show');
});
Route::group(['middleware' => ['auth:api', '!patient']], function () {
  Route::post('/casehistories', 'api\CaseHistoryController@store');
  Route::patch('/casehistories/{caseHistory}', 'api\CaseHistoryController@update');
  Route::delete('/casehistories/{caseHistory}', 'api\CaseHistoryController@destroy');
});

// Prescriptions
Route::group(['middleware' => ['auth:api']], function () {
  Route::get('/prescriptions', 'api\PrescriptionController@index');
  Route::get('/prescriptions/{prescription}', 'api\PrescriptionController@show');
});
Route::group(['middleware' => ['auth:api', '!receptionist', '!patient']], function () {
  Route::post('/prescriptions', 'api\PrescriptionController@store');
  Route::patch('/prescriptions/{prescription}', 'api\PrescriptionController@update');
  Route::delete('/prescriptions/{prescription}', 'api\PrescriptionController@destroy');
});

// Appointment
Route::group(['middleware' => ['auth:api']], function () {
  Route::get('/appointments', 'api\AppointmentController@index');
  Route::post('/appointments', 'api\AppointmentController@store');
  Route::get('/appointments/{appointment}', 'api\AppointmentController@show');
});
Route::group(['middleware' => ['auth:api', '!patient']], function () {
  Route::patch('/appointments/{appointment}', 'api\AppointmentController@update');
  Route::delete('/appointments/{appointment}', 'api\AppointmentController@destroy');
});

// Invoices
Route::group(['middleware' => ['auth:api']], function () {
  Route::get('/invoices/{invoice}', 'api\InvoiceController@show');
});
Route::group(['middleware' => ['auth:api', '!patient']], function () {
  Route::get('/invoices', 'api\InvoiceController@index');
  Route::post('/invoices', 'api\InvoiceController@store');
  Route::patch('/invoices/{invoice}', 'api\InvoiceController@update');

  Route::get('/invoices/{invoice}/deposits/show', 'api\InvoiceController@deposits');
});
Route::group(['middleware' => ['auth:api', '!doctor', '!receptionist', '!patient']], function () {
  Route::delete('/invoices/{invoice}', 'api\InvoiceController@destroy');
});

// Deposits
Route::group(['middleware' => ['auth:api']], function () {
  Route::get('/invoices/deposits', 'api\DepositController@index');
  Route::get('/invoices/{invoice}/deposits/{deposit}', 'api\DepositController@show');
});
Route::group(['middleware' => ['auth:api', '!patient']], function () {
  Route::post('/invoices/{invoice}/deposits', 'api\DepositController@store');
  Route::patch('/invoices/{invoice}/deposits/{deposit}', 'api\DepositController@update');
});
Route::group(['middleware' => ['auth:api', '!doctor', '!receptionist', '!patient']], function () {
  Route::delete('/invoices/{invoice}/deposits/{deposit}', 'api\DepositController@destroy');
});

// Categories
Route::group(['middleware' => ['auth:api', '!receptionist', '!patient']], function () {
  Route::post('/categories', 'api\CategoryController@store');
  Route::patch('/categories/{category}', 'api\CategoryController@update');
  Route::delete('/categories/{category}', 'api\CategoryController@destroy');
});
Route::group(['middleware' => ['auth:api', '!patient']], function () {
  Route::get('/categories', 'api\CategoryController@index');
  Route::get('/categories/{category}', 'api\CategoryController@show');
});

// Treatments
Route::group(['middleware' => ['auth:api', '!receptionist', '!patient']], function () {
  Route::post('/treatments', 'api\TreatmentController@store');
  Route::patch('/treatments/{treatment}', 'api\TreatmentController@update');
  Route::delete('/treatments/{treatment}', 'api\TreatmentController@destroy');
});
Route::group(['middleware' => ['auth:api', '!patient']], function () {
  Route::get('/treatments', 'api\TreatmentController@index');
  Route::get('/treatments/{treatment}', 'api\TreatmentController@show');
});

// Stocks
Route::group(['middleware' => ['auth:api', '!patient']], function () {
  Route::get('/stocks', 'api\StockController@index');
  Route::post('/stocks', 'api\StockController@store');
  Route::get('/stocks/{stock}', 'api\StockController@show');
  Route::patch('/stocks/{stock}', 'api\StockController@update');
  Route::delete('/stocks/{stock}', 'api\StockController@destroy');
});
Route::group(['middleware' => ['auth:api', '!receptionist', '!patient']], function () {
  Route::delete('/stocks/{stock}', 'api\StockController@destroy');
});

// Settings
Route::get('/settings', 'api\SettingController@index');
Route::group(['middleware' => ['auth:api', 'admin']], function () {
  Route::patch('/settings/{setting}', 'api\SettingController@update');
});

// Dashboard
Route::group(['middleware' => ['auth:api']], function () {
  Route::get('/dashboard', 'api\DashboardController@index');
});
