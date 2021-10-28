<?php

namespace App\Http\Controllers\api;

use App\Category;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => ['bail', 'string', Rule::in(['category', 'description'])],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string'],
            'not_paginate' => ['boolean']
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $not_paginate = $data['not_paginate'] ?? null;

        $categories = Category::select('id', 'category', 'description')
            ->when($search, function ($query, $search) {
                return $query->where('category', 'like', '%' . $search . '%');
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                return $query->orderBy($order_by, $order_direction);
            }, function ($query) {
                return $query->orderBy('id', 'desc');
            });

        $categories = $not_paginate ?
            $categories->take($per_page)->get() : $categories->paginate($per_page);

        return response()->json([
            'categories' => $categories
        ]);
    }

    public function store()
    {
        $data = request()->validate([
            'category' => ['bail', 'required', 'string', 'max:255'],
            'description' => ['bail', 'nullable', 'string', 'max:255'],
        ]);

        $category = Category::create($data);

        return response()->json([
            'category' => $category
        ]);
    }

    public function show(Category $category)
    {
        return response()->json([
            'category' => [
                'id' => $category->id,
                'category' => $category->category,
                'description' => $category->description
            ]
        ]);
    }

    public function update(Category $category)
    {
        $data = request()->validate([
            'category' => ['bail', 'required', 'string', 'max:255'],
            'description' => ['bail', 'nullable', 'string', 'max:255'],
        ]);

        $category->update($data);

        return response()->json([
            'id' => $category->id,
            'category' => $category->category,
            'description' => $category->description
        ]);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'success' => true
        ]);
    }
}
