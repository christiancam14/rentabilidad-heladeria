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
        Schema::create('cierres_mes', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('anio');
            $table->unsignedTinyInteger('mes');
            $table->decimal('gastos', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['anio', 'mes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cierres_mes');
    }
};
