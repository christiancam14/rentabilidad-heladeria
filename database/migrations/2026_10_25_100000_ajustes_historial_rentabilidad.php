<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * - Conceptos de gasto fijo archivables (conservan los meses anteriores).
     * - Margen con más rango: un precio mal digitado no debe romper el guardado.
     */
    public function up(): void
    {
        Schema::table('conceptos_gasto_fijo', function (Blueprint $table) {
            // Periodo (AAAAMM) desde el cual el concepto deja de mostrarse
            $table->unsignedInteger('archivado_desde')->nullable()->after('nombre');
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->decimal('porcentaje_rentabilidad', 12, 2)->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('conceptos_gasto_fijo', function (Blueprint $table) {
            $table->dropColumn('archivado_desde');
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->decimal('porcentaje_rentabilidad', 5, 2)->default(0)->change();
        });
    }
};
