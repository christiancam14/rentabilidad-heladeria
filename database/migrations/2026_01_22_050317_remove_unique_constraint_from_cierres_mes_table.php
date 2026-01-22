<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Eliminar la restricción única usando SQL directo
        // MySQL no soporta DROP INDEX IF EXISTS, así que usamos un enfoque más seguro
        try {
            DB::statement('ALTER TABLE cierres_mes DROP INDEX cierres_mes_anio_mes_unique');
        } catch (\Exception $e) {
            // Si la restricción no existe o tiene otro nombre, intentar con el método de Laravel
            try {
                Schema::table('cierres_mes', function (Blueprint $table) {
                    $table->dropUnique(['anio', 'mes']);
                });
            } catch (\Exception $e2) {
                // Ignorar si no existe
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cierres_mes', function (Blueprint $table) {
            $table->unique(['anio', 'mes']);
        });
    }
};
