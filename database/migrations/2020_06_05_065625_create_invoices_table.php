<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInvoicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('personnel_id');
            $table->date('date');
            $table->decimal('total', 13, 2);
            $table->decimal('discount', 13, 2)->nullable();
            $table->string('discount_type')->nullable();
            $table->decimal('due', 13, 2);
            $table->string('note')->nullable();
            $table->timestamps();

            $table->foreign('patient_id')->references('id')->on('patients')
                ->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invoices');
    }
}
