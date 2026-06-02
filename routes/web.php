<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Rutas de Insumos
    Route::resource('insumos', \App\Http\Controllers\InsumoController::class);

    // Rutas de Productos
    Route::resource('productos', \App\Http\Controllers\ProductoController::class)->except(['create', 'edit']);
    Route::post('productos/{producto}/insumos', [\App\Http\Controllers\ProductoController::class, 'agregarInsumo'])->name('productos.insumos.store');
    Route::put('productos/{producto}/insumos/{insumo}', [\App\Http\Controllers\ProductoController::class, 'actualizarInsumo'])->name('productos.insumos.update');
    Route::delete('productos/{producto}/insumos/{insumo}', [\App\Http\Controllers\ProductoController::class, 'eliminarInsumo'])->name('productos.insumos.destroy');
    Route::post('productos/{producto}/recalcular', [\App\Http\Controllers\ProductoController::class, 'recalcularTotales'])->name('productos.recalcular');

    // Rutas de Cierres de Mes
    Route::resource('cierres-mes', \App\Http\Controllers\CierreMesController::class)->except(['create', 'edit']);
    Route::post('cierres-mes/{cierre_mes}/productos', [\App\Http\Controllers\CierreMesController::class, 'agregarProducto'])->name('cierres-mes.productos.store');
    Route::put('cierres-mes/{cierre_mes}/productos/{producto}', [\App\Http\Controllers\CierreMesController::class, 'actualizarProducto'])->name('cierres-mes.productos.update');
    Route::delete('cierres-mes/{cierre_mes}/productos/{producto}', [\App\Http\Controllers\CierreMesController::class, 'eliminarProducto'])->name('cierres-mes.productos.destroy');
    Route::post('cierres-mes/{cierre_mes}/gastos', [\App\Http\Controllers\CierreMesController::class, 'agregarGasto'])->name('cierres-mes.gastos.store');
    Route::put('cierres-mes/{cierre_mes}/gastos/{gasto}', [\App\Http\Controllers\CierreMesController::class, 'actualizarGasto'])->name('cierres-mes.gastos.update');
    Route::delete('cierres-mes/{cierre_mes}/gastos/{gasto}', [\App\Http\Controllers\CierreMesController::class, 'eliminarGasto'])->name('cierres-mes.gastos.destroy');

    Route::prefix('finanzas')->name('finanzas.')->group(function () {
        Route::get('consolidado', [\App\Http\Controllers\Finanzas\ConsolidadoController::class, 'index'])->name('consolidado.index');
        Route::get('ventas', [\App\Http\Controllers\Finanzas\VentaController::class, 'index'])->name('ventas.index');
        Route::post('ventas', [\App\Http\Controllers\Finanzas\VentaController::class, 'store'])->name('ventas.store');
        Route::put('ventas/{venta}', [\App\Http\Controllers\Finanzas\VentaController::class, 'update'])->name('ventas.update');
        Route::delete('ventas/{venta}', [\App\Http\Controllers\Finanzas\VentaController::class, 'destroy'])->name('ventas.destroy');
        Route::get('compras', [\App\Http\Controllers\Finanzas\CompraController::class, 'index'])->name('compras.index');
        Route::post('compras', [\App\Http\Controllers\Finanzas\CompraController::class, 'store'])->name('compras.store');
        Route::put('compras/{compra}', [\App\Http\Controllers\Finanzas\CompraController::class, 'update'])->name('compras.update');
        Route::delete('compras/{compra}', [\App\Http\Controllers\Finanzas\CompraController::class, 'destroy'])->name('compras.destroy');
        Route::get('nomina', [\App\Http\Controllers\Finanzas\NominaController::class, 'index'])->name('nomina.index');
        Route::post('nomina/empleados', [\App\Http\Controllers\Finanzas\NominaController::class, 'storeEmpleado'])->name('nomina.empleados.store');
        Route::put('nomina/empleados/{empleado}', [\App\Http\Controllers\Finanzas\NominaController::class, 'updateEmpleado'])->name('nomina.empleados.update');
        Route::delete('nomina/empleados/{empleado}', [\App\Http\Controllers\Finanzas\NominaController::class, 'destroyEmpleado'])->name('nomina.empleados.destroy');
        Route::post('nomina/semanas', [\App\Http\Controllers\Finanzas\NominaController::class, 'upsertSemana'])->name('nomina.semanas.upsert');
        Route::get('gastos-fijos', [\App\Http\Controllers\Finanzas\GastoFijoController::class, 'index'])->name('gastos-fijos.index');
        Route::post('gastos-fijos/conceptos', [\App\Http\Controllers\Finanzas\GastoFijoController::class, 'storeConcepto'])->name('gastos-fijos.conceptos.store');
        Route::delete('gastos-fijos/conceptos/{concepto}', [\App\Http\Controllers\Finanzas\GastoFijoController::class, 'destroyConcepto'])->name('gastos-fijos.conceptos.destroy');
        Route::post('gastos-fijos/valores', [\App\Http\Controllers\Finanzas\GastoFijoController::class, 'upsertValor'])->name('gastos-fijos.valores.upsert');
        Route::get('tarjeta-bbva', [\App\Http\Controllers\Finanzas\TarjetaBbvaController::class, 'index'])->name('tarjeta-bbva.index');
        Route::post('tarjeta-bbva', [\App\Http\Controllers\Finanzas\TarjetaBbvaController::class, 'store'])->name('tarjeta-bbva.store');
        Route::put('tarjeta-bbva/{movimiento}', [\App\Http\Controllers\Finanzas\TarjetaBbvaController::class, 'update'])->name('tarjeta-bbva.update');
        Route::delete('tarjeta-bbva/{movimiento}', [\App\Http\Controllers\Finanzas\TarjetaBbvaController::class, 'destroy'])->name('tarjeta-bbva.destroy');
    });
});

require __DIR__.'/settings.php';
