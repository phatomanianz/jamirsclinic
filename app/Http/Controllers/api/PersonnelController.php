<?php

namespace App\Http\Controllers\api;

use App\Appointment;
use App\Http\Controllers\Controller;
use App\Personnel;
use App\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PersonnelController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'role' => ['bail', 'string', Rule::in(['admin', 'doctor', 'receptionist'])],
            'search' => ['string']
        ]);

        $role = $data['role'] ?? null;
        $search = $data['search'] ?? null;

        $personnels = Personnel::join('accounts', 'personnels.account_id', '=', 'accounts.id')
            ->select('personnels.id', 'personnels.image', 'personnels.name', 'personnels.address', 'personnels.phone', 'accounts.email', 'accounts.role')
            ->whereNull('accounts.deleted_at')
            ->when($role, function ($query, $role) {
                return $query->where('accounts.role', $role);
            }, function ($query) {
                return $query->whereNotIn('accounts.role', ['patient']);
            })
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('personnels.id', 'like', '%' . $search . '%')
                        ->orWhere('personnels.name', 'like', '%' . $search . '%');
                });
            })
            ->orderBy('personnels.id', 'asc')
            ->take(10)
            ->get();

        foreach ($personnels as $personnel) {
            $personnel->image = asset('/storage/' . $personnel->image);
        }

        return response()->json([
            'personnels' => $personnels
        ]);
    }

    public function doctors()
    {
        $data = request()->validate([
            'per_page' => ['numeric'],
            'order_by' => ['bail', 'string', Rule::in([
                'doctor_id', 'doctor_name', 'number_of_appointments_completed', 'number_of_prescriptions'
            ])],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string'],
            'not_paginate' => ['boolean']
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $not_paginate = $data['not_paginate'] ?? null;

        $doctors = Personnel::join('accounts', 'personnels.account_id', '=', 'accounts.id')
            ->leftJoin('appointments', 'personnels.id', '=', 'appointments.personnel_id')
            ->leftJoin(
                'prescriptions',
                'personnels.id',
                '=',
                'prescriptions.personnel_id'
            )
            ->select(
                'personnels.id as doctor_id',
                'personnels.name as doctor_name',
                DB::raw("COUNT(IF(appointments.status = 'completed', appointments.status, NULL)) as number_of_appointments_completed"),
                DB::raw('COUNT(IF(prescriptions.id, prescriptions.id, NULL)) as number_of_prescriptions')
            )
            ->where('accounts.role', 'doctor')
            ->groupBy('personnels.id')
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('personnels.id', 'like', '%' . $search . '%')
                        ->orWhere('personnels.name', 'like', '%' . $search . '%');
                });
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                return $query->orderBy($order_by, $order_direction);
            }, function ($query) {
                return $query->orderBy('personnels.id', 'desc');
            });

        $doctors = $not_paginate ?
            $doctors->take($per_page)->get() : $doctors->paginate($per_page);

        return response()->json([
            'doctors' => $doctors
        ]);
    }

    public function doctorAppointments(Personnel $doctor)
    {
        if ($doctor->user->role !== 'doctor') {
            return response()->json([
                'message' => 'Doctor not found'
            ], 404);
        }

        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => [
                'bail',
                'string',
                Rule::in([
                    'id', 'datetime', 'remarks', 'status', 'patient_id', 'patient_name',
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
                'appointments.datetime',
                'appointments.remarks',
                'appointments.status'
            )
            ->where('personnels.id', $doctor->id)
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
                        ->orWhere('patients.name', 'like', '%' . $search . '%');
                });
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'patient_name' || $order_by === "patient_id") {
                    return $query->orderBy('patients.' . str_replace('patient_', '', $order_by), $order_direction);
                } else {
                    return $query->orderBy('appointments.' . $order_by, $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('appointments.datetime', 'desc');
            })
            ->paginate($per_page);


        return response()->json([
            'doctor_id' => $doctor->id,
            'doctor_name' => $doctor->name,
            'appointments' => $appointments
        ]);
    }

    public function doctorPrescriptions(Personnel $doctor)
    {
        if ($doctor->user->role !== 'doctor') {
            return response()->json([
                'message' => 'Doctor not found'
            ], 404);
        }

        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => [
                'bail',
                'string',
                Rule::in([
                    'id', 'date', 'medication', 'note', 'patient_name', 'patient_id'
                ])
            ],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string']
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $prescriptions = Prescription::join('patients', 'prescriptions.patient_id', '=', 'patients.id')
            ->join('personnels', 'prescriptions.personnel_id', '=', 'personnels.id')
            ->select('prescriptions.id', 'prescriptions.date', 'prescriptions.medication', 'prescriptions.note', 'patients.name as patient_name', 'patients.id as patient_id')
            ->where('personnels.id', $doctor->id)
            ->when($search, function ($query, $search) {
                return $query->where('prescriptions.date', 'like', '%' . $search . '%')
                    ->orWhere('patients.id', 'like', '%' . $search . '%')
                    ->orWhere('patients.name', 'like', '%' . $search . '%');
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'patient_name' || $order_by === "patient_id") {
                    return $query->orderBy('patients.' . str_replace('patient_', '', $order_by), $order_direction);
                } else {
                    return $query->orderBy('prescriptions.' . $order_by, $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('prescriptions.date', 'desc');
            })
            ->paginate($per_page);


        return response()->json([
            'doctor_id' => $doctor->id,
            'doctor_name' => $doctor->name,
            'prescriptions' => $prescriptions
        ]);
    }
}
