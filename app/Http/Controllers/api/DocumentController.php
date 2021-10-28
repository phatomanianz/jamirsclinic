<?php

namespace App\Http\Controllers\api;

use App\Document;
use App\Patient;
use App\Http\Controllers\Controller;
use App\Rules\PatientExists;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => [
                'bail',
                'string',
                Rule::in([
                    'id', 'date', 'file', 'description', 'patient_name', 'patient_id'
                ])
            ],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string']
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $documents = Document::join('patients', 'documents.patient_id', '=', 'patients.id')
            ->select('documents.id', 'documents.date', 'documents.file', 'documents.description', 'patients.name as patient_name', 'patients.id as patient_id')
            ->when($search, function ($query, $search) {
                return $query->where('documents.date', 'like', '%' . $search . '%')
                    ->orWhere('patients.id', 'like', '%' . $search . '%')
                    ->orWhere('patients.name', 'like', '%' . $search . '%');
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'patient_name' || $order_by === "patient_id") {
                    return $query->orderBy('patients.' . str_replace('patient_', '', $order_by), $order_direction);
                } else {
                    return $query->orderBy('documents.' . $order_by, $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('documents.date', 'desc');
            })
            ->paginate($per_page);

        foreach ($documents->items() as $document) {
            $document->file = asset('/storage/' . $document->file);
        }

        return response()->json([
            'documents' => $documents
        ]);
    }


    public function store()
    {
        $data = request()->validate([
            'patient_id' => ['bail', 'required', 'numeric', new PatientExists],
            'date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'file' => [
                'bail', 'required', 'file',
                'mimes:jpeg,jpg,bmp,png,doc,pdf,docx,ppt,txt,zip,rar',
                'max:10000'
            ],
            'description' => ['bail', 'nullable', 'string', 'max:255']
        ]);

        $latestDocument = Document::latest()->first();
        $documentCount = $latestDocument ? ($latestDocument->id + 1) : 1;

        $fileName = $documentCount . '-' . $data['file']->getClientOriginalName();
        $filePath = $data['file']->storeAs(
            'documents',
            $fileName,
            'public'
        );

        $document = Document::create([
            'patient_id' => $data['patient_id'],
            'date' => $data['date'],
            'file' => $filePath,
            'description' => $data['description'] ?? null
        ]);

        return response()->json([
            'id' => $document->id,
            'date' => $document->date,
            'file' => $document->file,
            'description' => $document->description,
            'patient_id' => $document->patient->id,
            'patient_name' => $document->patient->name,
        ]);
    }

    public function show(Document $document)
    {

        $document->file = asset('/storage/' . $document->file);

        return response()->json([
            'document' => [
                'id' => $document->id,
                'date' => $document->date->format('m-d-Y'),
                'file' => $document->file,
                'description' => $document->description,
                'patient_id' => $document->patient->id,
                'patient_name' => $document->patient->name,
            ]
        ]);
    }

    public function update(Document $document)
    {
        $data = request()->validate([
            'patient_id' => ['bail', 'required', 'numeric', new PatientExists],
            'date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'file' => [
                'bail', 'file', 'mimes:jpeg,jpg,bmp,png,doc,pdf,docx,ppt,txt,zip,rar', 'max:10000'
            ],
            'description' => ['bail', 'nullable', 'string', 'max:255']
        ]);

        if (isset($data['file'])) {
            Storage::delete('/public/' . $document->file);

            $fileName = $document->id . '-' . $data['file']->getClientOriginalName();
            $filePath = request('file')->storeAs(
                'documents',
                $fileName,
                'public'
            );

            $document->update([
                'patient_id' => $data['patient_id'],
                'date' => $data['date'],
                'file' => $filePath,
                'description' => $data['description'] ?? null
            ]);
        } else {
            $document->update([
                'patient_id' => $data['patient_id'],
                'date' => $data['date'],
                'description' => $data['description'] ?? null
            ]);
        }

        return response()->json([
            'document' => [
                'id' => $document->id,
                'date' => $document->date,
                'file' => $document->file,
                'description' => $document->description,
                'patient_id' => $document->patient->id,
                'patient_name' => $document->patient->name,
            ]
        ]);
    }

    public function destroy(Document $document)
    {
        Storage::delete('/public/' . $document->file);
        $document->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
