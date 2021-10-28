<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule;
use App\Rules\CategoryExists;
use Illuminate\Http\Request;
use App\Treatment;

class TreatmentController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => ['bail', 'string', Rule::in(['id', 'category', 'name', 'description', 'purchase_price', 'selling_price'])],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string'],
            'not_paginate' => ['boolean']
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $not_paginate = $data['not_paginate'] ?? null;

        $treatments = Treatment::join('categories', 'treatments.category_id', '=', 'categories.id')
            ->select('treatments.id', 'categories.category', 'treatments.name', 'treatments.description', 'treatments.purchase_price', 'treatments.selling_price')
            ->when($search, function ($query, $search) {
                return $query->where('treatments.id', 'like', '%' . $search . '%')
                    ->orWhere('categories.category', 'like', '%' . $search . '%')
                    ->orWhere('treatments.name', 'like', '%' . $search . '%')
                    ->orWhere('treatments.description', 'like', '%' . $search . '%')
                    ->orWhere('treatments.purchase_price', 'like', '%' . $search . '%')
                    ->orWhere('treatments.selling_price', 'like', '%' . $search . '%');
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'category') {
                    return $query->orderBy('categories.' . $order_by, $order_direction);
                } else {
                    return $query->orderBy('treatments.' . $order_by, $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('id', 'desc');
            });

        $treatments = $not_paginate ?
            $treatments->take($per_page)->get() : $treatments->paginate($per_page);

        return response()->json([
            'treatments' => $treatments
        ]);
    }

    public function store()
    {
        $data = request()->validate([
            'category_id' => ['bail', 'required', 'numeric', new CategoryExists],
            'name' => ['bail', 'required', 'string', 'max:255'],
            'description' => ['bail', 'nullable', 'string', 'max:255'],
            'purchase_price' => ['bail', 'required', 'numeric', 'min:0'],
            'selling_price' => ['bail', 'required', 'numeric', 'min:0']
        ]);

        $treatment = Treatment::create($data);

        return response()->json([
            'treatment' => [
                'id' => $treatment->id,
                'category' => $treatment->category->category,
                'category_id' => $treatment->category->id,
                'name' => $treatment->category->name,
                'description' => $treatment->description,
                'purchase_price' => $treatment->purchase_price,
                'selling_price' => $treatment->selling_price
            ]
        ]);
    }

    public function show(Treatment $treatment)
    {
        return response()->json([
            'treatment' => [
                'id' => $treatment->id,
                'category' => $treatment->category->category,
                'category_id' => $treatment->category->id,
                'name' => $treatment->name,
                'description' => $treatment->description,
                'purchase_price' => $treatment->purchase_price,
                'selling_price' => $treatment->selling_price
            ]
        ]);
    }

    public function update(Treatment $treatment)
    {
        $data = request()->validate([
            'category_id' => ['bail', 'required', 'numeric', new CategoryExists],
            'name' => ['bail', 'required', 'string', 'max:255'],
            'description' => ['bail', 'nullable', 'string', 'max:255'],
            'purchase_price' => ['bail', 'required', 'numeric', 'min:0'],
            'selling_price' => ['bail', 'required', 'numeric', 'min:0']
        ]);

        $treatment->update($data);

        return response()->json([
            'treatment' => [
                'id' => $treatment->id,
                'category' => $treatment->category->category,
                'category_id' => $treatment->category->id,
                'name' => $treatment->category->name,
                'description' => $treatment->description,
                'purchase_price' => $treatment->purchase_price,
                'selling_price' => $treatment->selling_price
            ]
        ]);
    }

    public function destroy(Treatment $treatment)
    {
        $treatment->delete();

        response()->json([
            'success' => true
        ]);
    }
}
