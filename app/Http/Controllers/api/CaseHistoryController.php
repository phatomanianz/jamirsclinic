<?php

namespace App\Http\Controllers\api;

use App\Patient;
use App\CaseHistory;
use App\Http\Controllers\Controller;
use App\Rules\PatientExists;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CaseHistoryController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => [
                'bail',
                'string',
                Rule::in([
                    'id', 'date', 'description', 'note', 'patient_name', 'patient_id'
                ])
            ],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string']
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $caseHistories = CaseHistory::join('patients', 'case_histories.patient_id', '=', 'patients.id')
            ->select('case_histories.id', 'case_histories.date', 'case_histories.description', 'case_histories.note', 'patients.name as patient_name', 'patients.id as patient_id')
            ->when($search, function ($query, $search) {
                return $query->where('case_histories.date', 'like', '%' . $search . '%')
                    ->orWhere('patients.id', 'like', '%' . $search . '%')
                    ->orWhere('patients.name', 'like', '%' . $search . '%');
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'patient_name' || $order_by === "patient_id") {
                    return $query->orderBy('patients.' . str_replace('patient_', '', $order_by), $order_direction);
                } else {
                    return $query->orderBy('case_histories.' . $order_by, $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('case_histories.date', 'desc');
            })
            ->paginate($per_page);


        return response()->json([
            'case_histories' => $caseHistories
        ]);
    }


    public function store()
    {
        $data = request()->validate([
            'patient_id' => ['bail', 'required', 'numeric', new PatientExists],
            'date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'description' => ['bail', 'required', 'string', 'max:255'],
            'note' => ['bail', 'nullable', 'string']
        ]);

        $caseHistory = CaseHistory::create($data);

        return response()->json([
            'case_history' => [
                'id' => $caseHistory->id,
                'date' => $caseHistory->date->format('m-d-Y'),
                'description' => $caseHistory->description,
                'note' => $caseHistory->note,
                'patient_id' => $caseHistory->patient->id,
                'patient_name' => $caseHistory->patient->name
            ]
        ]);
    }

    public function show(CaseHistory $caseHistory)
    {
        return response()->json([
            'case_history' => [
                'id' => $caseHistory->id,
                'date' => $caseHistory->date->format('m-d-Y'),
                'description' => $caseHistory->description,
                'note' => $caseHistory->note,
                'patient_id' => $caseHistory->patient->id,
                'patient_name' => $caseHistory->patient->name
            ]
        ]);
    }

    public function update(CaseHistory $caseHistory)
    {
        $data = request()->validate([
            'patient_id' => ['bail', 'required', 'numeric', new PatientExists],
            'date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'description' => ['bail', 'required', 'string', 'max:255'],
            'note' => ['bail', 'nullable', 'string']
        ]);

        $caseHistory->update($data);

        return response()->json([
            'case_history' => $caseHistory->load('patient')
        ]);
    }

    public function destroy(CaseHistory $caseHistory)
    {
        $caseHistory->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
