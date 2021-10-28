<?php

namespace App\Http\Controllers\api;

use App\Patient;
use App\User;
use App\Http\Controllers\Controller;
use App\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PatientController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'per_page' => ['numeric'],
            'order_by' => ['bail', 'string', Rule::in(['id', 'name', 'phone', 'due'])],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string'],
            'not_paginate' => ['boolean']
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $not_paginate = $data['not_paginate'] ?? null;

        $patients = Patient::leftJoin('invoices', 'patients.id', '=', 'invoices.patient_id')
            ->select('patients.id', 'patients.name', 'patients.phone', DB::raw('IFNULL(SUM(invoices.due), 0) as due'))
            ->groupBy('patients.id')
            ->when($search, function ($query, $search) {
                return $query->where('patients.id', 'like', '%' . $search . '%')
                    ->orWhere('patients.name', 'like', '%' . $search . '%');
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'due') {
                    return $query->orderBy('invoices.' . $order_by, $order_direction);
                } else {
                    return $query->orderBy('patients.' . $order_by, $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('patients.id', 'desc');
            });

        $patients = $not_paginate ?
            $patients->take($per_page)->get() : $patients->paginate($per_page);

        return response()->json([
            'patients' => $patients
        ]);
    }

    public function store()
    {
        $data = request()->validate([
            'email' => ['bail', 'nullable', 'string', 'email', 'max:255', 'unique:accounts'],
            'password' => ['bail', 'nullable', 'string', 'min:8', 'confirmed', 'max:255'],
            'name' => ['bail', 'required', 'string', 'max:255'],
            'address' => ['bail', 'required', 'string', 'max:255'],
            'phone' => ['bail', 'required', 'string', 'max:255'],
            'birthdate' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'sex' => ['bail', 'required', 'string', Rule::in(['male', 'female'])],
            'image' => ['image'],
            'note' => ['bail', 'nullable', 'string']
        ]);

        $imagePath = isset($data['image']) ?
            $data['image']->store('patients', 'public') : 'patients/default/patient.png';

        $user = User::create([
            'email' => $data['email'],
            'password' => isset($data['password']) ? Hash::make($data['password']) : null,
            'role' => 'patient'
        ]);

        $user->patient()->create([
            'name' => $data['name'],
            'address' => $data['address'],
            'phone' => $data['phone'],
            'birthdate' => $data['birthdate'],
            'sex' => $data['sex'],
            'image' => $imagePath,
            'note' => $data['note']
        ]);
        $user->patient->image = asset('/storage/' . $user->patient->image);

        return response()->json(['patient' => [
            'id' => $user->patient->id,
            'name' => $user->patient->name,
            'sex' => $user->patient->sex,
            'birthdate' => $user->patient->birthdate,
            'phone' => $user->patient->phone,
            'address' => $user->patient->address,
            'image' => $user->patient->image,
            'note' => $user->patient->note,
            'email' => $user->email
        ]]);
    }

    public function show(Patient $patient)
    {
        $patient->image = asset('/storage/' . $patient->image);

        $documents = $patient->documents()
            ->select('documents.id', 'documents.date', 'documents.file', 'documents.description')
            ->orderBy('documents.created_at', 'desc')
            ->get();
        foreach ($documents as $index => $document) {
            $documents[$index]->file = asset('/storage/' . $document->file);
        }

        $histories = $patient->histories()
            ->select('case_histories.id', 'case_histories.date', 'case_histories.description', 'case_histories.note')
            ->orderBy('case_histories.date', 'desc')
            ->get();

        $prescriptions = $patient->prescriptions()
            ->join('personnels', 'prescriptions.personnel_id', '=', 'personnels.id')
            ->select('prescriptions.id', 'prescriptions.medication', 'prescriptions.note', 'prescriptions.date', 'personnels.id as doctor_id', 'personnels.name as doctor')
            ->orderBy('prescriptions.date', 'desc')
            ->get();

        $appointments = $patient->appointments()
            ->leftJoin('personnels', 'appointments.personnel_id', '=', 'personnels.id')
            ->select('appointments.id', 'appointments.datetime', 'appointments.status', 'appointments.remarks', DB::raw("IFNULL(personnels.id, 'N/A') as doctor_id"), DB::raw("IFNULL(personnels.name, 'N/A') as doctor_name"))
            ->orderBy('appointments.datetime', 'desc')
            ->get();

        return response()->json([
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name,
                'sex' => $patient->sex,
                'birthdate' => $patient->birthdate->format('m-d-Y'),
                'phone' => $patient->phone,
                'address' => $patient->address,
                'image' => $patient->image,
                'note' => $patient->note,
                'email' => $patient->user->email,
                'case_histories' => $histories,
                'prescriptions' => $prescriptions,
                'documents' => $documents,
                'appointments' => $appointments,
            ]
        ]);
    }


    public function update(Patient $patient)
    {
        $data = request()->validate([
            'email' => ['bail', 'nullable', 'string', 'email', 'max:255'],
            'password' => ['bail', 'nullable', 'string', 'min:8', 'confirmed', 'max:255'],
            'name' => ['bail', 'required', 'string', 'max:255'],
            'address' => ['bail', 'required', 'string', 'max:255'],
            'phone' => ['bail', 'required', 'string', 'max:255'],
            'birthdate' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'sex' => ['bail', 'required', 'string', Rule::in(['male', 'female'])],
            'image' => ['image'],
            'note' => ['bail', 'nullable', 'string']
        ]);

        if (isset($data['email'])) {
            // Check if email is already used by another user.
            if (User::where('email', $data['email'])->where('id', '!=', $patient->user->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The given data was invalid.',
                    'errors' => ['email' => ['The email has already been taken.']]
                ], 422);
            }
        }

        $patient->user()->update(
            isset($data['password']) ? [
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'patient'
            ] : [
                'email' => $data['email'],
                'role' => 'patient'
            ]
        );

        $imageDefaultPath = 'patients/default/patient.png';
        $imagePath = isset($data['image']) ?
            $data['image']->store('patients', 'public') : $imageDefaultPath;

        if ($patient->image !== $imageDefaultPath) {
            Storage::delete('/public/' . $patient->image);
        }

        $patient->update([
            'name' => $data['name'],
            'address' => $data['address'],
            'phone' => $data['phone'],
            'birthdate' => $data['birthdate'],
            'sex' => $data['sex'],
            'image' => $imagePath,
            'note' => $data['note']
        ]);

        $patient->image = asset('/storage/' . $patient->image);

        return response()->json(['patient' => [
            'id' => $patient->id,
            'name' => $patient->name,
            'sex' => $patient->sex,
            'birthdate' => $patient->birthdate,
            'phone' => $patient->phone,
            'address' => $patient->address,
            'image' => $patient->image,
            'note' => $patient->note,
            'email' => $patient->user->email
        ]]);
    }

    public function destroy(Patient $patient)
    {
        $imageDefaultPath = 'patients/default/patient.png';
        if ($patient->image !== $imageDefaultPath) {
            Storage::delete('/public/' . $patient->image);
        }

        $patient->user->forceDelete();

        return response()->json([
            'success' => true
        ]);
    }

    public function histories(Patient $patient)
    {
        $patient->load('histories');
        $patient->image = asset('/storage/' . $patient->image);

        return response()->json(['patient' => [
            'id' => $patient->id,
            'name' => $patient->name,
            'sex' => $patient->sex,
            'birthdate' => $patient->birthdate->format('m-d-Y'),
            'phone' => $patient->phone,
            'address' => $patient->address,
            'image' => $patient->image,
            'email' => $patient->user->email,
            'case_histories' => $patient->histories,
        ]]);
    }

    public function prescriptions(Patient $patient)
    {
        $patient->load('prescriptions');
        $patient->image = asset('/storage/' . $patient->image);

        return response()->json(['patient' => [
            'id' => $patient->id,
            'name' => $patient->name,
            'sex' => $patient->sex,
            'birthdate' => $patient->birthdate->format('m-d-Y'),
            'phone' => $patient->phone,
            'address' => $patient->address,
            'image' => $patient->image,
            'email' => $patient->user->email,
            'prescriptions' => $patient->prescriptions,
        ]]);
    }

    public function documents(Patient $patient)
    {
        $patient->image = asset('/storage/' . $patient->image);

        $documents = $patient->documents()
            ->select('documents.id', 'documents.created_at as date', 'documents.file', 'documents.description')
            ->orderBy('documents.created_at', 'desc')
            ->get();

        foreach ($documents as $document) {
            $document->file = asset('/storage/' . $document->file);
        }

        return response()->json(['patient' => [
            'id' => $patient->id,
            'name' => $patient->name,
            'sex' => $patient->sex,
            'birthdate' => $patient->birthdate->format('m-d-Y'),
            'phone' => $patient->phone,
            'address' => $patient->address,
            'image' => $patient->image,
            'email' => $patient->user->email,
            'documents' => $documents
        ]]);
    }

    public function appointments(Patient $patient)
    {
        $patient->load('appointments');
        $patient->image = asset('/storage/' . $patient->image);

        return response()->json(['patient' => [
            'id' => $patient->id,
            'name' => $patient->name,
            'sex' => $patient->sex,
            'birthdate' => $patient->birthdate->format('m-d-Y'),
            'phone' => $patient->phone,
            'address' => $patient->address,
            'image' => $patient->image,
            'email' => $patient->user->email,
            'appointments' => $patient->appointments,
        ]]);
    }

    public function invoices(Patient $patient)
    {
        $data = request()->validate([
            'date_from' => ['bail', 'date', 'date_format:Y-m-d'],
            'date_to' => ['bail', 'date', 'date_format:Y-m-d'],
        ]);

        $dateFrom = $data['date_from'] ?? null;
        $dateTo = $data['date_to'] ?? null;

        if (isset($dateFrom) || isset($dateTo)) {
            $errorField = null;
            if (!isset($dateFrom)) {
                $errorField = 'date_from';
            }
            if (!isset($dateTo)) {
                $errorField = 'date_to';
            }

            if ($errorField) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        $errorField => 'The ' .  str_replace('_', ' ', $errorField) . ' field is required'
                    ]
                ], 422);
            }
        }

        $invoices = Invoice::leftJoin('deposits', 'invoices.id', '=', 'deposits.invoice_id')
            ->select(
                'invoices.id',
                'invoices.date',
                'invoices.total',
                DB::raw('IFNULL(SUM(deposits.amount), 0) as deposits'),
                'invoices.due'
            )
            ->groupBy('invoices.id')
            ->where('invoices.patient_id', $patient->id)
            ->when($dateFrom, function ($query, $dateFrom) use ($dateTo) {
                return $query->whereBetween(DB::raw('DATE(invoices.date)'), [$dateFrom, $dateTo]);
            })
            ->get();

        return response()->json([
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name,
                'address' => $patient->address,
                'phone' => $patient->phone,
                'sex' => $patient->sex,
                'birthdate' => $patient->birthdate,
                'image' => asset('/storage/' . $patient->image),
                'email' => $patient->user->email
            ],
            'invoices' => $invoices,
            'total_invoice' => [
                'total_bill' => $invoices->sum('total'),
                'total_deposit' => $invoices->sum('deposits'),
                'total_due' => $invoices->sum('due')
            ]
        ]);
    }
}
