<?php

namespace App\Http\Controllers\api;

use App\Appointment;
use App\Http\Controllers\Controller;
use App\Rules\PatientExists;
use App\Rules\PersonnelExists;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => [
                'bail',
                'string',
                Rule::in([
                    'id', 'datetime', 'remarks', 'status', 'patient_id', 'patient_name', 'doctor_id', 'doctor_name'
                ])
            ],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string'],
            'filtered_by_date' => [
                'bail', 'string',
                Rule::in([
                    'today',
                    'upcoming'
                ])
            ],
            'filtered_by_status' => [
                'bail', 'string',
                Rule::in([
                    'requested',
                    'pending confirmation',
                    'confirmed',
                    'completed',
                    'cancelled',
                    'no show'
                ])
            ]
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $filtered_by_date = $data['filtered_by_date'] ?? null;
        $filtered_by_status = $data['filtered_by_status'] ?? null;

        $appointments = Appointment::join('patients', 'appointments.patient_id', '=', 'patients.id')
            ->leftJoin('personnels', 'appointments.personnel_id', '=', 'personnels.id')
            ->select(
                'appointments.id',
                'patients.id as patient_id',
                'patients.name as patient_name',
                DB::raw("IFNULL(personnels.id, 'N/A') as doctor_id"),
                DB::raw("IFNULL(personnels.name, 'N/A') as doctor_name"),
                'appointments.datetime',
                'appointments.remarks',
                'appointments.status'
            )
            ->when($filtered_by_date, function ($query, $filtered_by_date) {
                if ($filtered_by_date === 'today') {
                    return $query->whereDate('appointments.datetime', '=', date('Y-m-d'));
                } else {
                    return $query->whereDate('appointments.datetime', '>', date('Y-m-d'));
                }
            })
            ->when($filtered_by_status, function ($query, $filtered_by_status) {
                return $query->where('appointments.status', $filtered_by_status);
            })
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('appointments.id', 'like', '%' . $search . '%')
                        ->orWhere('appointments.datetime', 'like', '%' . $search . '%')
                        ->orWhere('patients.id', 'like', '%' . $search . '%')
                        ->orWhere('patients.name', 'like', '%' . $search . '%')
                        ->orWhere('personnels.id', 'like', '%' . $search . '%')
                        ->orWhere('personnels.name', 'like', '%' . $search . '%');
                });
            })
            ->when(auth()->user(), function ($query, $authUser) {
                if ($authUser->role === 'patient') {
                    return $query->where('patients.id', $authUser->patient->id);
                } else if ($authUser->role === 'doctor') {
                    return $query->where('personnels.id', $authUser->personnel->id);
                } else {
                    return $query;
                }
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'patient_name' || $order_by === "patient_id") {
                    return $query->orderBy('patients.' . str_replace('patient_', '', $order_by), $order_direction);
                } else if ($order_by === 'doctor_name' || $order_by === "doctor_id") {
                    return $query->orderBy('personnels.' . str_replace('doctor_', '', $order_by), $order_direction);
                } else {
                    return $query->orderBy('appointments.' . $order_by, $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('appointments.datetime', 'desc');
            })
            ->paginate($per_page);


        return response()->json([
            'appointments' => $appointments
        ]);
    }

    public function store()
    {
        $data = request()->validate([
            'patient_id' => ['bail', 'required', 'numeric', new PatientExists],
            'personnel_id' => ['bail', 'nullable', 'numeric', new PersonnelExists],
            'datetime' => ['bail', 'required', 'date', 'date_format:Y-m-d H:i:s'],
            'remarks' => ['bail', 'nullable', 'string', 'max:255'],
            'status' => [
                'bail', 'required', 'string', 'max:255',
                Rule::in([
                    'requested',
                    'pending confirmation',
                    'confirmed',
                    'completed',
                    'cancelled',
                    'no show'
                ])
            ]
        ]);

        if (auth()->user()->role === 'patient') {
            $data['personnel_id'] = null;
            if ($data['status'] !== 'requested') {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => ['status' => ['The selected status is invalid.']]
                ], 422);
            }
        } else {
            if ($data['status'] === 'requested') {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => ['status' => ['The selected status is invalid.']]
                ], 422);
            }
        }

        $appointment = Appointment::create($data);

        return response()->json([
            'appointment' => [
                'id' => $appointment->id,
                'datetime' => $appointment->datetime->format('m-d-Y h:i A'),
                'patient_id' => $appointment->patient->id,
                'patient_name' => $appointment->patient->name,
                'doctor_id' => $appointment->personnel->id ?? "N/A",
                'doctor_name' => $appointment->personnel->name ?? "N/A",
                'status' => $appointment->status,
                'remarks' => $appointment->remarks
            ]
        ]);
    }

    public function show(Appointment $appointment)
    {
        return response()->json([
            'appointment' => [
                'id' => $appointment->id,
                'datetime' => $appointment->datetime->format('m-d-Y h:i A'),
                'patient_id' => $appointment->patient->id,
                'patient_name' => $appointment->patient->name,
                'doctor_id' => $appointment->personnel->id ?? "N/A",
                'doctor_name' => $appointment->personnel->name ?? "N/A",
                'status' => $appointment->status,
                'remarks' => $appointment->remarks
            ]
        ]);
    }

    public function update(Appointment $appointment)
    {
        $data = request()->validate([
            'patient_id' => ['bail', 'required', 'numeric', new PatientExists],
            'personnel_id' => ['bail', 'nullable', 'numeric', new PersonnelExists],
            'datetime' => ['bail', 'required', 'date', 'date_format:Y-m-d H:i:s'],
            'remarks' => ['bail', 'nullable', 'string', 'max:255'],
            'status' => [
                'bail', 'required', 'string', 'max:255',
                Rule::in([
                    'pending confirmation',
                    'confirmed',
                    'completed',
                    'cancelled',
                    'no show'
                ])
            ]
        ]);

        $appointment->update($data);

        return response()->json([
            'appointment' => [
                'id' => $appointment->id,
                'datetime' => $appointment->datetime->format('m-d-Y h:i A'),
                'patient_id' => $appointment->patient->id,
                'patient_name' => $appointment->patient->name,
                'doctor_id' => $appointment->personnel->id ?? "N/A",
                'doctor_name' => $appointment->personnel->name ?? "N/A",
                'status' => $appointment->status,
                'remarks' => $appointment->remarks
            ]
        ]);
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
