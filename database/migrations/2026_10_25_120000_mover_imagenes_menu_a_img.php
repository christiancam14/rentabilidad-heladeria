<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Las fotos del catálogo pasaron de public/menu/productos a public/img/productos
     * para que la carpeta no choque con la ruta /menu.
     */
    public function up(): void
    {
        DB::table('productos')
            ->where('imagen', 'like', '/menu/productos/%')
            ->update(['imagen' => DB::raw("REPLACE(imagen, '/menu/productos/', '/img/productos/')")]);
    }

    public function down(): void
    {
        DB::table('productos')
            ->where('imagen', 'like', '/img/productos/%')
            ->update(['imagen' => DB::raw("REPLACE(imagen, '/img/productos/', '/menu/productos/')")]);
    }
};
