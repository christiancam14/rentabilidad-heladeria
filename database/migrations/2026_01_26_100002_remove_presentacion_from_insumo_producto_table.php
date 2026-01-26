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
        Schema::table('insumo_producto', function (Blueprint $table) {
            $table->dropColumn('presentacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('insumo_producto', function (Blueprint $table) {
            $table->decimal('presentacion', 10, 2)->after('insumo_id');
        });
    }
};
