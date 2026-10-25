<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Datos de contacto conocidos de cada sede (solo se completan si están vacíos). */
    private const CONTACTO = [
        'rocio' => ['whatsapp' => '3046155628', 'maps_url' => 'https://maps.app.goo.gl/WJW2xhxiGGad8ett5'],
        'marsella' => ['whatsapp' => '3108285537', 'maps_url' => 'https://maps.app.goo.gl/AM18SHMh6Fc13QAZ7'],
    ];

    public function up(): void
    {
        Schema::table('sedes', function (Blueprint $table) {
            $table->string('maps_url')->nullable()->after('whatsapp');
        });

        foreach (self::CONTACTO as $slug => $datos) {
            foreach ($datos as $campo => $valor) {
                DB::table('sedes')->where('slug', $slug)->whereNull($campo)->update([$campo => $valor]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('sedes', function (Blueprint $table) {
            $table->dropColumn('maps_url');
        });
    }
};
