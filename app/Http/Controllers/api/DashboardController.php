<?php

namespace App\Http\Controllers\api;

use App\Appointment;
use App\CaseHistory;
use App\Document;
use App\Http\Controllers\Controller;
use App\Invoice;
use App\Patient;
use App\Personnel;
use App\Prescription;
use App\Treatment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        if (auth()->user()->role === 'patient') {
            return $this->getDashboardPatientData();
        } else {
            return $this->getDashboardMainData();
        }
    }

    private function getDashboardPatientData()
    {
        $authUser = auth()->user();

        $apppointmentTotal = Appointment::where('patient_id', $authUser->patient->id)->count();
        $prescriptionTotal = Prescription::where('patient_id', $authUser->patient->id)->count();
        $caseHistoryTotal = CaseHistory::where('patient_id', $authUser->patient->id)->count();
        $documentTotal = Document::where('patient_id', $authUser->patient->id)->count();
        $invoiceTotal = Invoice::where('patient_id', $authUser->patient->id)->count();

        $todayAppointment = Appointment::where('patient_id', $authUser->patient->id)
            ->whereDate('datetime', date('Y-m-d'))->count();

        return response()->json([
            'dashboard' => [
                'apppointment_total' => $apppointmentTotal,
                'prescription_total' => $prescriptionTotal,
                'caseHistory_total' => $caseHistoryTotal,
                'document_total' => $documentTotal,
                'invoice_total' => $invoiceTotal,
                'today_appointment' => $todayAppointment
            ]
        ]);
    }

    private function getDashboardMainData()
    {
        $isDoctor = auth()->user()->role === 'doctor' ? true : false;

        $doctorTotal = Personnel::join('accounts', 'personnels.account_id', '=', 'accounts.id')
            ->where('accounts.role', 'doctor')
            ->count();
        $patientTotal = Patient::count();
        $apppointmentTotal =  Appointment::when($isDoctor, function ($query, $isDoctor) {
            return $query->where('personnel_id', auth()->user()->personnel->id);
        })->count();
        $prescriptionTotal = Prescription::count();
        $caseHistoryTotal = CaseHistory::count();
        $documentTotal = Document::count();
        $invoiceTotal = Invoice::count();
        $treatmentTotal = Treatment::count();
        $salesAndProfit = $this->getTotalSalesAndProfit();

        $todayAppointment = Appointment::when($isDoctor, function ($query, $isDoctor) {
            return $query->where('personnel_id', auth()->user()->personnel->id);
        })->whereDate('datetime', date('Y-m-d'))->count();
        $todayPatientRegistered = Patient::whereDate('created_at', date('Y-m-d'))->count();
        $todayPayment = Invoice::whereDate('date', date('Y-m-d'))->count();

        return response()->json([
            'dashboard' => [
                'doctor_total' => $doctorTotal,
                'patient_total' => $patientTotal,
                'apppointment_total' => $apppointmentTotal,
                'prescription_total' => $prescriptionTotal,
                'caseHistory_total' => $caseHistoryTotal,
                'document_total' => $documentTotal,
                'invoice_total' => $invoiceTotal,
                'treatment_total' => $treatmentTotal,
                'today_appointment' => $todayAppointment,
                'today_patient_registered' => $todayPatientRegistered,
                'today_payment' => $todayPayment,
                'sales_and_profit' => $salesAndProfit
            ]
        ]);
    }

    private function getTotalSalesAndProfit()
    {
        $totalSalesAndProfit = $this->queryTotalSalesAndProfit();

        return [
            'total_sales' => $totalSalesAndProfit['Sales'],
            'total_profit' => $totalSalesAndProfit['Profit'],
            'current_year_per_month_total_sales_and_profit' => [
                array_merge(['name' => 'January'], $this->queryTotalSalesAndProfit(1, date('Y'))),
                array_merge(['name' => 'February'], $this->queryTotalSalesAndProfit(2, date('Y'))),
                array_merge(['name' => 'March'], $this->queryTotalSalesAndProfit(3, date('Y'))),
                array_merge(['name' => 'April'], $this->queryTotalSalesAndProfit(4, date('Y'))),
                array_merge(['name' => 'May'], $this->queryTotalSalesAndProfit(5, date('Y'))),
                array_merge(['name' => 'June'], $this->queryTotalSalesAndProfit(6, date('Y'))),
                array_merge(['name' => 'July'], $this->queryTotalSalesAndProfit(7, date('Y'))),
                array_merge(['name' => 'August'], $this->queryTotalSalesAndProfit(8, date('Y'))),
                array_merge(['name' => 'September'], $this->queryTotalSalesAndProfit(9, date('Y'))),
                array_merge(['name' => 'October'], $this->queryTotalSalesAndProfit(10, date('Y'))),
                array_merge(['name' => 'November'], $this->queryTotalSalesAndProfit(11, date('Y'))),
                array_merge(['name' => 'December'], $this->queryTotalSalesAndProfit(12, date('Y'))),
            ]
        ];
    }

    private function queryTotalSalesAndProfit($month = null, $year = null)
    {
        $total = Invoice::leftJoin('transactions', 'invoices.id', '=', 'transactions.invoice_id')
            ->select(
                DB::raw('IFNULL(SUM(transactions.sold_price * transactions.quantity), 0) as sales'),
                DB::raw('IFNULL(SUM((transactions.sold_price * transactions.quantity) - (transactions.purchase_price * transactions.quantity)) - SUM(invoices.due), 0) as profit')
            )
            ->when($month, function ($query, $month) {
                return $query->whereMonth('invoices.date', $month);
            })
            ->when($year, function ($query, $year) {
                return $query->whereYear('invoices.date', $year);
            })
            ->first();

        return ['Sales' => $total->sales, 'Profit' => $total->profit];
    }
}
