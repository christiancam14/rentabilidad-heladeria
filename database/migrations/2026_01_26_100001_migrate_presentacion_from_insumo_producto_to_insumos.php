<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrar la presentación desde insumo_producto a insumos
        // Para cada insumo, tomamos el valor más común de presentación
        $insumos = DB::table('insumos')->get();

        foreach ($insumos as $insumo) {
            // Obtener el valor más común de presentación para este insumo
            $presentacionComun = DB::table('insumo_producto')
                ->where('insumo_id', $insumo->id)
                ->select('presentacion', DB::raw('COUNT(*) as count'))
                ->groupBy('presentacion')
                ->orderByDesc('count')
                ->first();

            if ($presentacionComun) {
                // Actualizar el insumo con la presentación más común
                DB::table('insumos')
                    ->where('id', $insumo->id)
                    ->update(['presentacion' => $presentacionComun->presentacion]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No hay forma de revertir esto sin perder datos
        // Simplemente dejamos los valores en insumos
    }
};
