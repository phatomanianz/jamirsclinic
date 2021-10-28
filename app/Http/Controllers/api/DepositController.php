<?php

namespace App\Http\Controllers\api;

use App\Deposit;
use App\Invoice;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepositController extends Controller
{
    public function index()
    {
        return response()->json([
            'deposits' => Deposit::with('invoice')->paginate()
        ]);
    }

    public function store(Invoice $invoice)
    {
        $data = request()->validate([
            'date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'amount' => ['bail', 'required', 'numeric', 'min:0'],
            'type' => ['bail', 'required', 'string', Rule::in(['cash', 'bank'])]
        ]);

        $invoice->update(['due' => $invoice->due - $data['amount']]);

        $deposit = $invoice->deposits()->create($data);

        return response()->json([
            'deposit' => [
                'id' => $deposit->id,
                'date' => $deposit->date->format('m-d-Y'),
                'amount' => $deposit->amount,
                'type' => $deposit->type,
                'invoice' => [
                    'id' => $invoice->id,
                    'patient_id' => $invoice->patient->id,
                    'patient_name' => $invoice->patient->name,
                    'user_id' => $invoice->personnel->id,
                    'user_name' => $invoice->personnel->name,
                    'date' => $invoice->date->format('m-d-Y'),
                    'total' => $invoice->total,
                    'discount' => $invoice->discount,
                    'discount_type' => $invoice->discount_type,
                    'due' => $invoice->due,
                    'note' => $invoice->note
                ]
            ]
        ]);
    }

    public function update(Invoice $invoice, Deposit $deposit)
    {
        $data = request()->validate([
            'date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'amount' => ['bail', 'required', 'numeric', 'min:0'],
            'type' => ['bail', 'required', 'string', Rule::in(['cash', 'bank'])]
        ]);

        $this->checkIfInvoiceHaveDeposit($invoice, $deposit);

        $invoice->update(['due' => $invoice->due + $deposit->amount]);
        $invoice->update(['due' => $invoice->due - $data['amount']]);

        $deposit->update($data);

        return response()->json([
            'deposit' => [
                'id' => $deposit->id,
                'date' => $deposit->date->format('m-d-Y'),
                'amount' => $deposit->amount,
                'type' => $deposit->type,
                'invoice' => [
                    'id' => $invoice->id,
                    'patient_id' => $invoice->patient->id,
                    'patient_name' => $invoice->patient->name,
                    'user_id' => $invoice->personnel->id,
                    'user_name' => $invoice->personnel->name,
                    'date' => $invoice->date->format('m-d-Y'),
                    'total' => $invoice->total,
                    'discount' => $invoice->discount,
                    'discount_type' => $invoice->discount_type,
                    'due' => $invoice->due,
                    'note' => $invoice->note
                ]
            ]
        ]);
    }

    public function show(Invoice $invoice, Deposit $deposit)
    {
        $this->checkIfInvoiceHaveDeposit($invoice, $deposit);

        return response()->json([
            'deposit' => [
                'id' => $deposit->id,
                'date' => $deposit->date->format('m-d-Y'),
                'amount' => $deposit->amount,
                'type' => $deposit->type,
                'invoice' => [
                    'id' => $invoice->id,
                    'patient_id' => $invoice->patient->id,
                    'patient_name' => $invoice->patient->name,
                    'user_id' => $invoice->personnel->id,
                    'user_name' => $invoice->personnel->name,
                    'date' => $invoice->date->format('m-d-Y'),
                    'total' => $invoice->total,
                    'discount' => $invoice->discount,
                    'discount_type' => $invoice->discount_type,
                    'due' => $invoice->due,
                    'note' => $invoice->note
                ]
            ]
        ]);
    }

    public function destroy(Invoice $invoice, Deposit $deposit)
    {
        $this->checkIfInvoiceHaveDeposit($invoice, $deposit);

        $invoice->update(['due' => $invoice->due + $deposit->amount]);
        $deposit->delete();

        return response()->json([
            'success' => true
        ]);
    }

    public function checkIfInvoiceHaveDeposit($invoice, $deposit)
    {
        if ($invoice->deposits()->where('id', $deposit->id)->doesntExist()) {
            abort(404, 'The given deposit not found in the given invoice');
        }
    }
}
