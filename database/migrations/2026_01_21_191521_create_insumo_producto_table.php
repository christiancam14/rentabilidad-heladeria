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
        Schema::create('insumo_producto', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
            $table->foreignId('insumo_id')->constrained('insumos')->onDelete('cascade');
            $table->decimal('presentacion', 10, 2);
            $table->decimal('cantidad_preparacion', 10, 2);
            $table->decimal('valor_unidad', 10, 2)->default(0);
            $table->decimal('costo_preparacion', 10, 2)->default(0);
            $table->timestamps();
            
            $table->unique(['producto_id', 'insumo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('insumo_producto');
    }
};
