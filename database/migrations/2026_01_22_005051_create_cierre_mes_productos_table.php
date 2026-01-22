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
        Schema::create('cierre_mes_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cierre_mes_id')->constrained('cierres_mes')->onDelete('cascade');
            $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
            $table->unsignedInteger('cantidad_vendida')->default(0);
            $table->decimal('precio_venta_snapshot', 10, 2);
            $table->decimal('costo_unitario_snapshot', 10, 2);
            $table->timestamps();

            $table->unique(['cierre_mes_id', 'producto_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cierre_mes_productos');
    }
};
