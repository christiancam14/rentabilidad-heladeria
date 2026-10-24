<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tablas del menú digital y pedidos (unificación con la landing A Tu Gusto).
     */
    public function up(): void
    {
        Schema::create('categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->string('emoji', 16)->nullable();
            $table->unsignedInteger('orden')->default(0);
            $table->boolean('visible')->default(true);
            $table->timestamps();
        });

        Schema::table('productos', function (Blueprint $table) {
            $table->foreignId('categoria_id')->nullable()->after('id')->constrained('categorias')->nullOnDelete();
            $table->text('descripcion')->nullable()->after('nombre');
            $table->string('imagen')->nullable()->after('descripcion');
            $table->string('color', 20)->nullable()->after('imagen');
            $table->string('etiqueta', 30)->nullable()->after('color');
            $table->unsignedInteger('precio_anterior')->nullable()->after('precio_venta_publico');
            $table->boolean('visible_menu')->default(false)->after('porcentaje_rentabilidad');
            $table->boolean('agotado')->default(false)->after('visible_menu');
            $table->unsignedInteger('orden')->default(0)->after('agotado');
        });

        Schema::create('producto_tamanos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->string('nombre');
            $table->integer('ajuste_precio')->default(0);
            $table->boolean('activo')->default(true);
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
        });

        // Biblioteca global de sabores y adicionales
        Schema::create('opciones', function (Blueprint $table) {
            $table->id();
            $table->string('tipo', 20); // sabor | adicional
            $table->string('nombre');
            $table->unsignedInteger('precio')->default(0);
            $table->boolean('disponible')->default(true);
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();

            $table->index(['tipo', 'orden']);
        });

        Schema::create('producto_grupos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->string('nombre');
            $table->string('tipo', 20); // sabor | adicional
            $table->boolean('obligatorio')->default(false);
            $table->unsignedTinyInteger('max_selecciones')->default(1);
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('opcion_producto_grupo', function (Blueprint $table) {
            $table->foreignId('producto_grupo_id')->constrained('producto_grupos')->cascadeOnDelete();
            $table->foreignId('opcion_id')->constrained('opciones')->cascadeOnDelete();
            $table->boolean('activo')->default(true);

            $table->primary(['producto_grupo_id', 'opcion_id']);
        });

        Schema::table('sedes', function (Blueprint $table) {
            $table->string('direccion')->nullable()->after('slug');
            $table->string('whatsapp', 30)->nullable()->after('direccion');
            $table->unsignedSmallInteger('tiempo_preparacion')->default(15)->after('whatsapp');
            $table->boolean('recibiendo_pedidos')->default(true)->after('tiempo_preparacion');
            $table->boolean('en_menu')->default(true)->after('recibiendo_pedidos');
            $table->json('horarios')->nullable()->after('en_menu');
        });

        // Disponibilidad por sede: sin fila = disponible
        Schema::create('producto_sede', function (Blueprint $table) {
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('sede_id')->constrained('sedes')->cascadeOnDelete();
            $table->boolean('disponible')->default(true);

            $table->primary(['producto_id', 'sede_id']);
        });

        Schema::create('cupones', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 40)->unique();
            $table->string('descripcion')->nullable();
            $table->unsignedTinyInteger('porcentaje');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->nullable()->unique();
            $table->string('token', 40)->unique(); // URL pública de seguimiento
            $table->foreignId('sede_id')->constrained('sedes')->cascadeOnDelete();
            $table->string('cliente_nombre');
            $table->string('cliente_telefono', 30);
            $table->string('metodo_pago', 30);
            $table->text('notas')->nullable();
            $table->string('cupon', 40)->nullable();
            $table->string('regalo')->nullable();
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('descuento')->default(0);
            $table->unsignedInteger('total');
            $table->string('estado', 20)->default('nuevo'); // nuevo | preparando | listo | entregado | cancelado
            $table->timestamp('listo_estimado')->nullable();
            $table->timestamps();

            $table->index(['sede_id', 'created_at']);
            $table->index('estado');
        });

        Schema::create('pedido_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
            $table->string('nombre');
            $table->string('detalle')->nullable();
            $table->unsignedSmallInteger('cantidad');
            $table->unsignedInteger('precio_unitario');
            $table->unsignedInteger('total');
            $table->timestamps();
        });

        Schema::create('configuraciones', function (Blueprint $table) {
            $table->string('clave')->primary();
            $table->json('valor')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuraciones');
        Schema::dropIfExists('pedido_items');
        Schema::dropIfExists('pedidos');
        Schema::dropIfExists('cupones');
        Schema::dropIfExists('producto_sede');

        Schema::table('sedes', function (Blueprint $table) {
            $table->dropColumn(['direccion', 'whatsapp', 'tiempo_preparacion', 'recibiendo_pedidos', 'en_menu', 'horarios']);
        });

        Schema::dropIfExists('opcion_producto_grupo');
        Schema::dropIfExists('producto_grupos');
        Schema::dropIfExists('opciones');
        Schema::dropIfExists('producto_tamanos');

        Schema::table('productos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('categoria_id');
            $table->dropColumn(['descripcion', 'imagen', 'color', 'etiqueta', 'precio_anterior', 'visible_menu', 'agotado', 'orden']);
        });

        Schema::dropIfExists('categorias');
    }
};
