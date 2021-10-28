<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Rules\TreatmentExists;
use App\Stock;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StockController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => ['bail', 'string', Rule::in(['id', 'treatment_id', 'treatment_name', 'quantity', 'created_at', 'updated_at'])],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string']
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $stocks = Stock::join('treatments', 'stocks.treatment_id', '=', 'treatments.id')
            ->select('stocks.id', 'treatments.id as treatment_id', 'treatments.name as treatment_name', 'stocks.quantity', 'stocks.created_at', 'stocks.updated_at')
            ->when($search, function ($query, $search) {
                return $query->where('stocks.id', 'like', '%' . $search . '%')
                    ->orWhere('treatments.id', 'like', '%' . $search . '%')
                    ->orWhere('treatments.name', 'like', '%' . $search . '%')
                    ->orWhere('stocks.quantity', 'like', '%' . $search . '%');
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'treatment_id') {
                    return $query->orderBy('treatments.id', $order_direction);
                } else if ($order_by === 'treatment_name') {
                    return $query->orderBy('treatments.name', $order_direction);
                } else {
                    return $query->orderBy('stocks.' . $order_by, $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('stocks.id', 'desc');
            })
            ->paginate($per_page);

        return response()->json([
            'stocks' => $stocks
        ]);
    }

    public function store()
    {
        $data = request()->validate([
            'treatment_id' => ['bail', 'required', 'numeric', new TreatmentExists],
            'quantity' => ['bail', 'required', 'numeric', 'min:0']
        ]);

        // Check if Treatment is already exists in stocks
        $stock = Stock::select('id', 'treatment_id', 'quantity')
            ->where('treatment_id', $data['treatment_id'])
            ->first();

        // Update stock quantity if treatment's stock already exists
        if (isset($stock)) {
            $stock->update([
                'quantity' => $stock->quantity + $data['quantity']
            ]);
        } else {
            $stock = Stock::create($data);
        }

        return response()->json([
            'stock' => [
                'id' => $stock->id,
                'treatment_id' => $stock->treatment->id,
                'treatment_name' => $stock->treatment->name,
                'quantity' => $stock->quantity
            ]
        ]);
    }

    public function show(Stock $stock)
    {
        return response()->json([
            'stock' => [
                'id' => $stock->id,
                'treatment_id' => $stock->treatment->id,
                'treatment_name' => $stock->treatment->name,
                'quantity' => $stock->quantity
            ]
        ]);
    }

    public function update(Stock $stock)
    {
        $data = request()->validate([
            'treatment_id' => ['bail', 'required', 'numeric', new TreatmentExists],
            'quantity' => ['bail', 'required', 'numeric', 'min:0']
        ]);

        $stock->update($data);

        return response()->json([
            'stock' => [
                'id' => $stock->id,
                'treatment_id' => $stock->treatment->id,
                'treatment_name' => $stock->treatment->name,
                'quantity' => $stock->quantity
            ]
        ]);
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();

        response()->json([
            'success' => true
        ]);
    }
}
