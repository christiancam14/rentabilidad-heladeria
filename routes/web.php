<?php

use App\Http\Controllers\Admin\CategoriaController;
use App\Http\Controllers\Admin\ConfiguracionController;
use App\Http\Controllers\Admin\OpcionController;
use App\Http\Controllers\Admin\PedidoController;
use App\Http\Controllers\Admin\ProductoMenuController;
use App\Http\Controllers\Admin\PromocionController;
use App\Http\Controllers\Admin\SedeActivaController;
use App\Http\Controllers\CierreMesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Finanzas\CompraController;
use App\Http\Controllers\Finanzas\ConsolidadoController;
use App\Http\Controllers\Finanzas\GastoFijoController;
use App\Http\Controllers\Finanzas\NominaController;
use App\Http\Controllers\Finanzas\TarjetaBbvaController;
use App\Http\Controllers\Finanzas\VentaController;
use App\Http\Controllers\InsumoController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\PedidoPublicoController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

// Menú digital público (pedidos para recoger)
Route::get('/', [MenuController::class, 'index'])->name('home');
Route::get('menu', [MenuController::class, 'index'])->name('menu');
Route::get('links', [MenuController::class, 'links'])->name('links');
Route::get('robots.txt', [SeoController::class, 'robots'])->name('robots');
Route::get('sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::post('pedidos', [PedidoPublicoController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('pedido.store');
Route::get('cupon/{codigo}', [PedidoPublicoController::class, 'cupon'])
    ->middleware('throttle:20,1')
    ->name('cupon.validar');
Route::get('pedido/{token}', [PedidoPublicoController::class, 'show'])->name('pedido.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Rutas de Insumos
    Route::resource('insumos', InsumoController::class);

    // Rutas de Productos
    Route::resource('productos', ProductoController::class)->except(['create', 'edit']);
    Route::post('productos/{producto}/insumos', [ProductoController::class, 'agregarInsumo'])->name('productos.insumos.store');
    Route::put('productos/{producto}/insumos/{insumo}', [ProductoController::class, 'actualizarInsumo'])->name('productos.insumos.update');
    Route::delete('productos/{producto}/insumos/{insumo}', [ProductoController::class, 'eliminarInsumo'])->name('productos.insumos.destroy');
    Route::post('productos/{producto}/recalcular', [ProductoController::class, 'recalcularTotales'])->name('productos.recalcular');

    // Rutas de Cierres de Mes
    Route::resource('cierres-mes', CierreMesController::class)->except(['create', 'edit']);
    Route::post('cierres-mes/{cierre_mes}/productos', [CierreMesController::class, 'agregarProducto'])->name('cierres-mes.productos.store');
    Route::put('cierres-mes/{cierre_mes}/productos/{producto}', [CierreMesController::class, 'actualizarProducto'])->name('cierres-mes.productos.update');
    Route::delete('cierres-mes/{cierre_mes}/productos/{producto}', [CierreMesController::class, 'eliminarProducto'])->name('cierres-mes.productos.destroy');
    Route::post('cierres-mes/{cierre_mes}/gastos', [CierreMesController::class, 'agregarGasto'])->name('cierres-mes.gastos.store');
    Route::put('cierres-mes/{cierre_mes}/gastos/{gasto}', [CierreMesController::class, 'actualizarGasto'])->name('cierres-mes.gastos.update');
    Route::delete('cierres-mes/{cierre_mes}/gastos/{gasto}', [CierreMesController::class, 'eliminarGasto'])->name('cierres-mes.gastos.destroy');

    // Panel administrativo del menú digital
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::post('sede-activa', [SedeActivaController::class, 'cambiar'])->name('sede-activa');
        Route::post('sede-activa/recibiendo', [SedeActivaController::class, 'recibiendo'])->name('sede-activa.recibiendo');

        Route::get('pedidos', [PedidoController::class, 'index'])->name('pedidos.index');
        Route::patch('pedidos/{pedido}', [PedidoController::class, 'update'])->name('pedidos.update');

        Route::post('productos/ordenar', [ProductoMenuController::class, 'ordenar'])->name('productos.ordenar');
        Route::patch('productos/{producto}/visibilidad', [ProductoMenuController::class, 'visibilidad'])->name('productos.visibilidad');
        Route::resource('productos', ProductoMenuController::class)->except(['show']);

        Route::post('categorias/ordenar', [CategoriaController::class, 'ordenar'])->name('categorias.ordenar');
        Route::resource('categorias', CategoriaController::class)
            ->parameters(['categorias' => 'categoria'])
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('opciones', OpcionController::class)
            ->parameters(['opciones' => 'opcion'])
            ->only(['index', 'store', 'update', 'destroy']);

        Route::get('promociones', [PromocionController::class, 'index'])->name('promociones.index');
        Route::post('promociones/destacado', [PromocionController::class, 'destacar'])->name('promociones.destacar');
        Route::post('cupones', [PromocionController::class, 'storeCupon'])->name('cupones.store');
        Route::put('cupones/{cupon}', [PromocionController::class, 'updateCupon'])->name('cupones.update');
        Route::delete('cupones/{cupon}', [PromocionController::class, 'destroyCupon'])->name('cupones.destroy');

        Route::get('configuracion', [ConfiguracionController::class, 'index'])->name('configuracion.index');
        Route::put('configuracion', [ConfiguracionController::class, 'update'])->name('configuracion.update');
    });

    Route::prefix('finanzas')->name('finanzas.')->group(function () {
        Route::get('consolidado', [ConsolidadoController::class, 'index'])->name('consolidado.index');
        Route::get('ventas', [VentaController::class, 'index'])->name('ventas.index');
        Route::post('ventas', [VentaController::class, 'store'])->name('ventas.store');
        Route::put('ventas/{venta}', [VentaController::class, 'update'])->name('ventas.update');
        Route::delete('ventas/{venta}', [VentaController::class, 'destroy'])->name('ventas.destroy');
        Route::get('compras', [CompraController::class, 'index'])->name('compras.index');
        Route::post('compras', [CompraController::class, 'store'])->name('compras.store');
        Route::put('compras/{compra}', [CompraController::class, 'update'])->name('compras.update');
        Route::delete('compras/{compra}', [CompraController::class, 'destroy'])->name('compras.destroy');
        Route::get('nomina', [NominaController::class, 'index'])->name('nomina.index');
        Route::post('nomina/empleados', [NominaController::class, 'storeEmpleado'])->name('nomina.empleados.store');
        Route::put('nomina/empleados/{empleado}', [NominaController::class, 'updateEmpleado'])->name('nomina.empleados.update');
        Route::delete('nomina/empleados/{empleado}', [NominaController::class, 'destroyEmpleado'])->name('nomina.empleados.destroy');
        Route::post('nomina/semanas', [NominaController::class, 'upsertSemana'])->name('nomina.semanas.upsert');
        Route::get('gastos-fijos', [GastoFijoController::class, 'index'])->name('gastos-fijos.index');
        Route::post('gastos-fijos/conceptos', [GastoFijoController::class, 'storeConcepto'])->name('gastos-fijos.conceptos.store');
        Route::delete('gastos-fijos/conceptos/{concepto}', [GastoFijoController::class, 'destroyConcepto'])->name('gastos-fijos.conceptos.destroy');
        Route::post('gastos-fijos/valores', [GastoFijoController::class, 'upsertValor'])->name('gastos-fijos.valores.upsert');
        Route::get('tarjeta-bbva', [TarjetaBbvaController::class, 'index'])->name('tarjeta-bbva.index');
        Route::post('tarjeta-bbva', [TarjetaBbvaController::class, 'store'])->name('tarjeta-bbva.store');
        Route::put('tarjeta-bbva/{movimiento}', [TarjetaBbvaController::class, 'update'])->name('tarjeta-bbva.update');
        Route::delete('tarjeta-bbva/{movimiento}', [TarjetaBbvaController::class, 'destroy'])->name('tarjeta-bbva.destroy');
    });
});

require __DIR__.'/settings.php';
