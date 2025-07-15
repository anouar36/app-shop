<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->integer('client_id');
            $table->integer('products_id');
            $table->string('client_name');
            $table->string('client_lastname');
            $table->string('email');
            $table->string('phone');
            $table->string('method_payment');
            $table->dateTime('date_creation');
            $table->date('date_arrival');
            $table->string('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
