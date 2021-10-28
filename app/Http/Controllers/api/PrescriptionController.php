<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Patient;
use App\Prescription;
use App\Rules\PatientExists;
use App\Rules\PersonnelExists;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PrescriptionController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => [
                'bail',
                'string',
                Rule::in([
                    'id', 'date', 'medication', 'note', 'doctor_name', 'doctor_id', 'patient_name', 'patient_id'
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
            ->select('prescriptions.id', 'prescriptions.date', 'prescriptions.medication', 'prescriptions.note', 'personnels.name as doctor_name', 'personnels.id as doctor_id', 'patients.name as patient_name', 'patients.id as patient_id')
            ->when($search, function ($query, $search) {
                return $query->where('prescriptions.date', 'like', '%' . $search . '%')
                    ->orWhere('patients.id', 'like', '%' . $search . '%')
                    ->orWhere('patients.name', 'like', '%' . $search . '%')
                    ->orWhere('personnels.id', 'like', '%' . $search . '%')
                    ->orWhere('personnels.name', 'like', '%' . $search . '%');
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'patient_name' || $order_by === "patient_id") {
                    return $query->orderBy('patients.' . str_replace('patient_', '', $order_by), $order_direction);
                } else if ($order_by === 'doctor_name' || $order_by === 'doctor_id') {
                    return $query->orderBy('personnels.' . str_replace('doctor_', '', $order_by), $order_direction);
                } else {
                    return $query->orderBy('prescriptions.' . $order_by, $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('prescriptions.date', 'desc');
            })
            ->paginate($per_page);


        return response()->json([
            'prescriptions' => $prescriptions
        ]);
    }

    public function store()
    {
        $data = request()->validate([
            'patient_id' => ['bail', 'required', 'numeric', new PatientExists],
            'personnel_id' => ['bail', 'required', 'numeric', new PersonnelExists],
            'date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'medication' => ['bail', 'required', 'string'],
            'note' => ['bail', 'nullable', 'string']
        ]);

        $prescription = Prescription::create($data);

        return response()->json([
            'prescription' => [
                'id' => $prescription->id,
                'date' => $prescription->date->format('m-d-Y'),
                'patient_id' => $prescription->patient->id,
                'patient_name' => $prescription->patient->name,
                'doctor_id' => $prescription->personnel->id,
                'doctor_name' => $prescription->personnel->name,
                'medication' => $prescription->medication,
                'note' => $prescription->note
            ]
        ]);
    }

    public function show(Prescription $prescription)
    {
        return response()->json([
            'prescription' => [
                'id' => $prescription->id,
                'date' => $prescription->date->format('m-d-Y'),
                'patient_id' => $prescription->patient->id,
                'patient_name' => $prescription->patient->name,
                'patient_address' => $prescription->patient->address,
                'patient_phone' => $prescription->patient->phone,
                'doctor_id' => $prescription->personnel->id ?? null,
                'doctor_name' => $prescription->personnel->name ?? null,
                'doctor_phone' => $prescription->personnel->phone ?? null,
                'medication' => $prescription->medication,
                'note' => $prescription->note
            ]
        ]);
    }

    public function update(Prescription $prescription)
    {
        $data = request()->validate([
            'patient_id' => ['bail', 'required', 'numeric', new PatientExists],
            'personnel_id' => ['bail', 'required', 'numeric', new PersonnelExists],
            'date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'medication' => ['bail', 'required', 'string'],
            'note' => ['bail', 'nullable', 'string']
        ]);

        $prescription->update($data);

        return response()->json([
            'prescription' => [
                'id' => $prescription->id,
                'date' => $prescription->date->format('m-d-Y'),
                'patient_id' => $prescription->patient->id,
                'patient_name' => $prescription->patient->name,
                'doctor_id' => $prescription->personnel->id,
                'doctor_name' => $prescription->personnel->name,
                'medication' => $prescription->medication,
                'note' => $prescription->note
            ]
        ]);
    }

    public function destroy(Prescription $prescription)
    {
        $prescription->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
