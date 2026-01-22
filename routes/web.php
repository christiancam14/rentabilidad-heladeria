<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome');
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
});

require __DIR__.'/settings.php';
