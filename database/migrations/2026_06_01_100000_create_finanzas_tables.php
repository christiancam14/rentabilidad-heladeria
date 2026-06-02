<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sedes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sede_id')->constrained('sedes')->cascadeOnDelete();
            $table->date('fecha');
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->unsignedBigInteger('efectivo')->default(0);
            $table->unsignedBigInteger('transferencia')->default(0);
            $table->timestamps();

            $table->index(['fecha', 'sede_id']);
        });

        Schema::create('compras', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->unsignedBigInteger('efectivo')->default(0);
            $table->unsignedBigInteger('transferencia')->default(0);
            $table->timestamps();

            $table->index('fecha');
        });

        Schema::create('empleados', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->unsignedBigInteger('valor_turno_completo')->nullable();
            $table->unsignedBigInteger('valor_medio_turno')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('nomina_semanas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('empleados')->cascadeOnDelete();
            $table->unsignedSmallInteger('anio');
            $table->unsignedTinyInteger('mes');
            $table->unsignedTinyInteger('semana');
            $table->unsignedTinyInteger('dias_turno_completo')->default(0);
            $table->unsignedBigInteger('valor_turno_completo')->default(0);
            $table->unsignedTinyInteger('dias_medio_turno')->default(0);
            $table->unsignedBigInteger('valor_medio_turno')->default(0);
            $table->unsignedBigInteger('pago_semana')->default(0);
            $table->timestamps();

            $table->unique(['empleado_id', 'anio', 'mes', 'semana']);
            $table->index(['anio', 'mes']);
        });

        Schema::create('conceptos_gasto_fijo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sede_id')->constrained('sedes')->cascadeOnDelete();
            $table->string('nombre');
            $table->timestamps();

            $table->unique(['sede_id', 'nombre']);
        });

        Schema::create('gastos_fijos_mes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('concepto_gasto_fijo_id')->constrained('conceptos_gasto_fijo')->cascadeOnDelete();
            $table->unsignedSmallInteger('anio');
            $table->unsignedTinyInteger('mes');
            $table->unsignedBigInteger('valor')->default(0);
            $table->timestamps();

            $table->unique(['concepto_gasto_fijo_id', 'anio', 'mes']);
            $table->index(['anio', 'mes']);
        });

        Schema::create('movimientos_tarjeta', function (Blueprint $table) {
            $table->id();
            $table->string('contexto', 20);
            $table->date('fecha');
            $table->string('no_transferencia')->nullable();
            $table->string('concepto');
            $table->unsignedBigInteger('valor');
            $table->timestamps();

            $table->index(['contexto', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_tarjeta');
        Schema::dropIfExists('gastos_fijos_mes');
        Schema::dropIfExists('conceptos_gasto_fijo');
        Schema::dropIfExists('nomina_semanas');
        Schema::dropIfExists('empleados');
        Schema::dropIfExists('compras');
        Schema::dropIfExists('ventas');
        Schema::dropIfExists('sedes');
    }
};
