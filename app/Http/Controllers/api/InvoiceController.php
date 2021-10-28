<?php

namespace App\Http\Controllers\api;

use App\Deposit;
use App\Http\Controllers\Controller;
use App\Invoice;
use App\Rules\DepositExists;
use App\Rules\PatientExists;
use App\Rules\TreatmentExists;
use App\Stock;
use App\Transaction;
use App\Treatment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InvoiceController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => [
                'bail',
                'string',
                Rule::in([
                    'id', 'patient_id', 'patient_name', 'date', 'sub_total', 'discount', 'discount_type', 'grand_total', 'paid_amount', 'due', 'note'
                ])
            ],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string']
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $invoices = Invoice::join('patients', 'invoices.patient_id', '=', 'patients.id')
            ->leftJoin('deposits', 'invoices.id', '=', 'deposits.invoice_id')
            ->select(
                'invoices.id',
                'patients.id as patient_id',
                'patients.name as patient_name',
                'invoices.date',
                DB::raw('SUM(invoices.total + IFNULL(invoices.discount, 0)) as sub_total'),
                DB::raw('IFNULL(invoices.discount, 0) as discount'),
                DB::raw("IFNULL(invoices.discount_type, 'N/A') as discount_type"),
                'invoices.total as grand_total',
                DB::raw('IFNULL(SUM(deposits.amount), 0) as paid_amount'),
                'invoices.due',
                'invoices.note'
            )
            ->groupBy('deposits.invoice_id')
            ->when($search, function ($query, $search) {
                return $query->where('invoices.id', 'like', "%$search%")
                    ->orWhere('invoices.date', 'like', "%$search%")
                    ->orWhere('patients.id', 'like', "%$search%")
                    ->orWhere('patients.name', 'like', "%$search%");
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'patient_name' || $order_by === "patient_id") {
                    return $query->orderBy(
                        'patients.' . str_replace('patient_', '', $order_by),
                        $order_direction
                    );
                } else if (
                    $order_by === 'sub_total' || $order_by === 'grand_total' ||
                    $order_by === 'paid_amount' || $order_by === 'discount' ||
                    $order_by === 'discount_type'
                ) {
                    return $query->orderBy($order_by, $order_direction);
                } else {
                    return $query->orderBy("invoices.$order_by", $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('date', 'desc');
            })
            ->paginate($per_page);

        return response()->json([
            'invoices' => $invoices
        ]);
    }

    public function store()
    {
        $data = request()->validate([
            'patient_id' => ['bail', 'required', 'numeric', new PatientExists],
            'invoice_date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'discount' => ['bail', 'required', 'numeric', 'min:0'],
            'discount_type' => [
                'bail', 'required', 'string',
                Rule::in(['none', 'amount', 'percent'])
            ],
            'transactions' => ['bail', 'required', 'array'],
            'transactions.*.treatment_id' => ['bail', 'required', 'numeric', new TreatmentExists],
            'transactions.*.quantity' => ['bail', 'required', 'numeric', 'min:1'],
            'note' => ['bail', 'nullable', 'string', 'max:255'],
            'deposit' => ['bail', 'required', 'numeric', 'min:0'],
            'deposit_type' => ['bail', 'required', 'string', Rule::in(['cash', 'bank'])],
            'deposit_date' => ['bail', 'required', 'date', 'date_format:Y-m-d']
        ]);

        // Check for duplicated treatment id's entries and caiculate total quantity
        $transactionsRequest = collect($data['transactions'])
            ->groupBy('treatment_id')
            ->map(function ($treatments, $key) {
                $treatmentWithCalculatedTotalQuantity = [
                    'treatment_id' => 0,
                    'quantity' => 0
                ];
                $treatments->each(function ($treatment, $key) use (&$treatmentWithCalculatedTotalQuantity) {
                    $treatmentWithCalculatedTotalQuantity['treatment_id'] = $treatment['treatment_id'];
                    $treatmentWithCalculatedTotalQuantity['quantity'] += $treatment['quantity'];
                });

                return $treatmentWithCalculatedTotalQuantity;
            })->values();

        // Check for available stocks
        $errors = [];
        $transactionsRequest->each(function ($treatment, $key) use (&$errors) {
            $availableStocks = Stock::select('treatment_id', 'quantity')
                ->where('treatment_id', $treatment['treatment_id'])
                ->first();

            if (isset($availableStocks)) {
                if ($treatment['quantity'] > $availableStocks->quantity) {
                    $errorMessage = $availableStocks->quantity == 0 ?
                        'Out of stocks' : 'The available stocks is ' . $availableStocks->quantity;
                    $errors['transactions.' . $key . '.quantity'] = [$errorMessage];
                }
            } else {
                $errors['transactions.' . $key . '.quantity'] = ['No available stocks'];
            }
        });

        // Response if not available stocks
        if (!empty($errors)) {
            return response()->json([
                'message' => 'Stocks is not enough',
                'errors' => $errors
            ], 422);
        }

        $patientId = $data['patient_id'];
        $invoiceDate = $data['invoice_date'];
        $note = $data['note'] ?? null;

        $treatmentsTransaction = [];
        $total = 0;
        $discount = $data['discount'];
        $discountType = $data['discount_type'];
        $deposit = $data['deposit'];
        $depositType = $data['deposit_type'];
        $depositDate = $data['deposit_date'];
        $dueAmount = 0;

        $discountTypePercentage = null;

        // Validate discount & discount_type 
        switch ($discountType) {
            case 'none':
                $discount = null;
                break;
            case 'percent':
                $discountConvertedToInt = intval($discount);
                if (!is_int($discountConvertedToInt)) {
                    return response()->json([
                        'message' => 'The given data was invalid.',
                        'errors' => ['discount' => ['The discount must be an integer.']]
                    ], 422);
                }
                if ($discountConvertedToInt < 1 || $discountConvertedToInt > 100) {
                    return response()->json([
                        'message' => 'The given data was invalid.',
                        'errors' => ['discount' => ['The discount must be between 1 and 100.']]
                    ], 422);
                }
                $discountTypePercentage = $discountConvertedToInt;
            default:
                // Do nothing... 
        }

        $transactionsRequest->each(function ($treatment, $key) use (&$treatmentsTransaction) {
            // Deduct stocks
            $stocks = Stock::select('id', 'treatment_id', 'quantity')
                ->where('treatment_id', $treatment['treatment_id'])
                ->first();

            $stocks->update(['quantity' => $stocks->quantity - $treatment['quantity']]);

            // Get each treatment's price and quantity for the transactions table record
            $treatmentData = Treatment::select('id', 'purchase_price', 'selling_price')
                ->where('id', $treatment['treatment_id'])
                ->first();

            array_push(
                $treatmentsTransaction,
                [
                    'treatment_id' => $treatmentData->id,
                    'purchase_price' => $treatmentData->purchase_price,
                    'sold_price' => $treatmentData->selling_price,
                    'quantity' => $treatment['quantity']
                ]
            );
        });

        // Get subtotal
        foreach ($treatmentsTransaction as $treatment) {
            $total += $treatment['sold_price'] * $treatment['quantity'];
        }

        // Get final total with discount's deduction
        switch ($discountType) {
            case 'percent':
                $discount = ($discountTypePercentage / 100) * $total;
                $total -= $discount;
                break;
            case 'amount':
                $total -= $discount;
                break;
            default:
                // No discount
        }

        // Get due amount
        $dueAmount = $total - $deposit;

        $invoice = Invoice::create([
            'patient_id' => $patientId,
            'personnel_id' => auth()->user()->personnel->id,
            'date' => $invoiceDate,
            'total' => $total,
            'discount' => $discountType === 'none' ? null : $discount,
            'discount_type' => $discountType === 'none' ? null : ($discountType === 'percent'
                ? $discountTypePercentage . '%' : $discountType),
            'due' => $dueAmount,
            'note' => $note,
        ]);

        $invoice->transactions()->createMany($treatmentsTransaction);
        $invoice->deposits()->create([
            'date' => $depositDate,
            'amount' => $deposit,
            'type' => $depositType
        ]);

        return response()->json([
            'invoice' => $invoice->load('transactions.treatment.category', 'deposits')
        ]);
    }

    public function show(Invoice $invoice)
    {
        $invoice = Invoice::join('patients', 'invoices.patient_id', '=', 'patients.id')
            ->join('personnels', 'invoices.personnel_id', '=', 'personnels.id')
            ->leftJoin('deposits', 'invoices.id', '=', 'deposits.invoice_id')
            ->select(
                'invoices.id',
                'patients.id as patient_id',
                'patients.name as patient_name',
                'patients.address as patient_address',
                'patients.phone as patient_phone',
                'personnels.id as user_id',
                'personnels.name as user_name',
                'invoices.date',
                DB::raw('SUM(invoices.total + IFNULL(invoices.discount, 0)) as sub_total'),
                DB::raw('IFNULL(invoices.discount, 0) as discount'),
                DB::raw("IFNULL(invoices.discount_type, 'none') as discount_type"),
                'invoices.total as grand_total',
                DB::raw('IFNULL(SUM(deposits.amount), 0) as paid_amount'),
                'invoices.due',
                'invoices.note'
            )
            ->groupBy('deposits.invoice_id')
            ->where('invoices.id', '=', $invoice->id)
            ->first();

        $transactions = Transaction::leftJoin('treatments', 'transactions.treatment_id', '=', 'treatments.id')
            ->select(
                DB::raw('IFNULL(treatments.id, null) as treatment_id'),
                DB::raw('IFNULL(treatments.name, null) as treatment_name'),
                'transactions.quantity',
                'transactions.sold_price'
            )
            ->where('transactions.invoice_id', $invoice->id)
            ->get();

        $deposits = Deposit::select('id', 'date', 'amount', 'type')
            ->where('invoice_id', $invoice->id)
            ->orderBy('date', 'asc')
            ->get();

        return response()->json([
            'invoice' => [
                'id' => $invoice->id,
                'patient_id' => $invoice->patient_id,
                'patient_name' => $invoice->patient_name,
                'patient_address' => $invoice->patient_address,
                'patient_phone' => $invoice->patient_phone,
                'user_id' => $invoice->user_id,
                'user_name' => $invoice->user_name,
                'date' => $invoice->date->format('m-d-Y'),
                'sub_total' => $invoice->sub_total,
                'discount' => $invoice->discount,
                'discount_type' => $invoice->discount_type,
                'grand_total' => $invoice->grand_total,
                'paid_amount' => $invoice->paid_amount,
                'due' => $invoice->due,
                'note' => $invoice->note,
                'transactions' => $transactions,
                'deposits' => $deposits
            ]
        ]);
    }

    public function update(Invoice $invoice)
    {
        $data = request()->validate([
            'patient_id' => ['bail', 'required', 'numeric', new PatientExists],
            'invoice_date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'discount' => ['bail', 'required', 'numeric', 'min:0'],
            'discount_type' => [
                'bail', 'required', 'string',
                Rule::in(['none', 'amount', 'percent'])
            ],
            'transactions' => ['bail', 'required', 'array'],
            'transactions.*.treatment_id' => ['bail', 'required', 'numeric', new TreatmentExists],
            'transactions.*.quantity' => ['bail', 'required', 'numeric', 'min:1'],
            'note' => ['bail', 'nullable', 'string', 'max:255'],
            'deposits' => ['bail', 'nullable', 'array'],
            'deposits.*.id' => ['bail', 'required', 'numeric', new DepositExists],
            'deposits.*.date' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'deposits.*.amount' => ['bail', 'required', 'numeric', 'min:0'],
            'deposits.*.type' => ['bail', 'required', 'string', Rule::in(['cash', 'bank'])],
        ]);

        $errors = [];

        // Check for duplicated deposits id's entries and calculate total amount
        $depositsCollection = collect($data['deposits'] ?? [])
            ->groupBy('id')
            ->map(function ($deposits, $key) {
                $depositWithCalculatedTotalAmount = [
                    'id' => 0,
                    'amount' => 0
                ];
                $deposits->each(function ($deposit, $key) use (&$depositWithCalculatedTotalAmount) {
                    $depositWithCalculatedTotalAmount['id'] = $deposit['id'];
                    $depositWithCalculatedTotalAmount['date'] = $deposit['date'];
                    $depositWithCalculatedTotalAmount['amount'] += $deposit['amount'];
                    $depositWithCalculatedTotalAmount['type'] = $deposit['type'];
                });

                return $depositWithCalculatedTotalAmount;
            })->values();

        // Validate if deposits belong to invoice
        $depositsCollection->each(function ($deposit, $key) use ($invoice, &$errors) {
            if ($invoice->deposits()->where('id', $deposit['id'])->doesntExist()) {
                $errors['deposits.' . $key . '.id'] = ['The deposit is not belong to invoice'];
            }
        });

        // Response if deposits not belong to invoice
        if (!empty($errors)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $errors
            ], 422);
        }

        // Check for duplicated treatment id's entries and caiculate total quantity
        $transactionsRequest = collect($data['transactions'])
            ->groupBy('treatment_id')
            ->map(function ($treatments, $key) {
                $treatmentWithCalculatedTotalQuantity = [
                    'treatment_id' => 0,
                    'quantity' => 0
                ];
                $treatments->each(function ($treatment, $key) use (&$treatmentWithCalculatedTotalQuantity) {
                    $treatmentWithCalculatedTotalQuantity['treatment_id'] = $treatment['treatment_id'];
                    $treatmentWithCalculatedTotalQuantity['quantity'] += $treatment['quantity'];
                });

                return $treatmentWithCalculatedTotalQuantity;
            })->values();

        // Check for available stocks
        $transactionsRequest->each(function ($treatment, $key) use ($invoice, &$errors) {
            // If the treatment is already exists in invoice transaction then get stocks plus treatment sold quantity
            $availableStocks = Stock::join('transactions', 'stocks.treatment_id', '=', 'transactions.treatment_id')
                ->select('stocks.treatment_id', DB::raw('SUM(stocks.quantity + transactions.quantity) as quantity'))
                ->groupBy('stocks.treatment_id', 'transactions.treatment_id')
                ->where('stocks.treatment_id', $treatment['treatment_id'])
                ->where('transactions.treatment_id', $treatment['treatment_id'])
                ->where('transactions.invoice_id', $invoice->id)
                ->first();

            // If the treatment is not exists in invoice transaction then get stocks
            if (is_null($availableStocks)) {
                $availableStocks = Stock::select('treatment_id', 'quantity')
                    ->where('treatment_id', $treatment['treatment_id'])
                    ->first();
            }

            // Validate available quantity
            if (isset($availableStocks)) {
                if ($treatment['quantity'] > $availableStocks->quantity) {
                    $errorMessage = $availableStocks->quantity == 0 ?
                        'Out of stocks' : 'The available stocks is ' . $availableStocks->quantity;
                    $errors['transactions.' . $key . '.quantity'] = [$errorMessage];
                }
            } else {
                $errors['transactions.' . $key . '.quantity'] = ['No available stocks'];
            }
        });

        // Response if not available stocks
        if (!empty($errors)) {
            return response()->json([
                'message' => 'Stocks is not enough',
                'errors' => $errors
            ], 422);
        }

        $patientId = $data['patient_id'];
        $invoiceDate = $data['invoice_date'];
        $note = $data['note'];

        $treatmentsTransaction = [];
        $total = 0;
        $discount = $data['discount'];
        $discountType = $data['discount_type'];
        $deposits = 0;
        $dueAmount = 0;

        $discountTypePercentage = null;

        // Validate discount & discount_type 
        switch ($discountType) {
            case 'none':
                $discount = null;
                break;
            case 'percent':
                $discountConvertedToInt = intval($discount);
                if (!is_int($discountConvertedToInt)) {
                    return response()->json([
                        'message' => 'The given data was invalid.',
                        'errors' => ['discount' => ['The discount must be an integer.']]
                    ], 422);
                }
                if ($discountConvertedToInt < 1 || $discountConvertedToInt > 100) {
                    return response()->json([
                        'message' => 'The given data was invalid.',
                        'errors' => ['discount' => ['The discount must be between 1 and 100.']]
                    ], 422);
                }
                $discountTypePercentage = $discountConvertedToInt;
            default:
                // Do nothing... 
        }

        /* ALL THE VALIDATION COMPLETED HERE */

        // Restore & delete existing transaction treatment's stocks
        $invoice->transactions->each(function ($transaction, $key) {
            if (isset($transaction->treatment)) {
                $treatmentStocks = Stock::select('id', 'treatment_id', 'quantity')
                    ->where('treatment_id', $transaction->treatment->id)
                    ->first();

                if (isset($treatmentStocks)) {
                    $treatmentStocks->update([
                        'quantity' => $treatmentStocks->quantity + $transaction->quantity
                    ]);
                } else {
                    $transaction->treatment->stocks()->create([
                        'quantity' => $transaction->quantity
                    ]);
                }
            }

            $transaction->delete();
        });

        $transactionsRequest->each(function ($treatment, $key) use (&$treatmentsTransaction) {
            // Deduct stocks
            $stocks = Stock::select('id', 'treatment_id', 'quantity')
                ->where('treatment_id', $treatment['treatment_id'])
                ->first();

            $stocks->update(['quantity' => $stocks->quantity - $treatment['quantity']]);

            // Get each treatment's price and quantity for the transactions table record
            $treatmentData = Treatment::select('id', 'purchase_price', 'selling_price')
                ->where('id', $treatment['treatment_id'])
                ->first();

            array_push(
                $treatmentsTransaction,
                [
                    'treatment_id' => $treatmentData->id,
                    'purchase_price' => $treatmentData->purchase_price,
                    'sold_price' => $treatmentData->selling_price,
                    'quantity' => $treatment['quantity']
                ]
            );
        });

        // Get total deposits
        $depositsCollection->each(function ($deposit, $key) use (&$deposits) {
            $deposits += $deposit['amount'];
        });

        // Get subtotal
        foreach ($treatmentsTransaction as $treatment) {
            $total += $treatment['sold_price'] * $treatment['quantity'];
        }

        // Get final total with discount's deduction
        switch ($discountType) {
            case 'percent':
                $discount = ($discountTypePercentage / 100) * $total;
                $total -= $discount;
                break;
            case 'amount':
                $total -= $discount;
                break;
            default:
                // No discount
        }

        // Get due amount
        $dueAmount = $total - $deposits;

        $invoice->update([
            'patient_id' => $patientId,
            'date' => $invoiceDate,
            'total' => $total,
            'discount' => $discountType === 'none' ? null : $discount,
            'discount_type' => $discountType === 'none' ? null : ($discountType === 'percent' ? $discountTypePercentage . '%' : $discountType),
            'due' => $dueAmount,
            'note' => $note,
        ]);

        $invoice->transactions()->createMany($treatmentsTransaction);

        $depositsCollection->each(function ($deposit, $key) use ($invoice) {
            $invoice->deposits()
                ->where('id', $deposit['id'])
                ->update([
                    'date' => $deposit['date'],
                    'amount' => $deposit['amount'],
                    'type' => $deposit['type']
                ]);
        });
        // Delete invoice deposits not included in deposits request
        Deposit::where('invoice_id', $invoice->id)
            ->whereNotIn(
                'id',
                $depositsCollection->map(function ($deposit, $key) {
                    return $deposit['id'];
                })
            )->get()->each(function ($deposit, $key) {
                $deposit->delete();
            });

        return response()->json([
            'invoice' => $invoice->load('transactions.treatment.category', 'deposits')
        ]);
    }

    public function destroy(Invoice $invoice)
    {
        // Restore & delete existing transaction treatment's stocks
        $invoice->transactions->each(function ($transaction, $key) {
            if (isset($transaction->treatment)) {
                $treatmentStocks = Stock::select('id', 'treatment_id', 'quantity')
                    ->where('treatment_id', $transaction->treatment->id)
                    ->first();

                if (isset($treatmentStocks)) {
                    $treatmentStocks->update([
                        'quantity' => $treatmentStocks->quantity + $transaction->quantity
                    ]);
                } else {
                    $transaction->treatment->stocks()->create([
                        'quantity' => $transaction->quantity
                    ]);
                }
            }
        });

        $invoice->delete();

        return response()->json(['success' => true]);
    }

    public function deposits(Invoice $invoice)
    {
        $data = request()->validate([
            'per_page' => ['bail', 'numeric'],
            'order_by' => [
                'bail',
                'string',
                Rule::in([
                    'id', 'date', 'amount', 'type'
                ])
            ],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string']
        ]);

        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $deposits = Deposit::select(
            'id',
            'date',
            'amount',
            'type'
        )
            ->where('invoice_id', $invoice->id)
            ->when($search, function ($query, $search) {
                return $query->where('id', 'like', "%$search%")
                    ->orWhere('date', 'like', "%$search%");
            })->when($order_by, function ($query, $order_by) use ($order_direction) {
                return $query->orderBy($order_by, $order_direction);
            }, function ($query) {
                return $query->orderBy('date', 'desc');
            })->paginate($per_page);

        return response()->json([
            'invoice_id' => $invoice->id,
            'patient_id' => $invoice->patient_id,
            'deposits' => $deposits
        ]);
    }
}
