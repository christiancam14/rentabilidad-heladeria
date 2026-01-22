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
        Schema::create('gastos_cierre_mes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cierre_mes_id')->constrained('cierres_mes')->onDelete('cascade');
            $table->string('nombre');
            $table->decimal('valor', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gastos_cierre_mes');
    }
};
