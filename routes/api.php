<?php

use App\Http\Controllers\InsumoController;
use App\Http\Controllers\ProductoController;
use Illuminate\Support\Facades\Route;

// Rutas de Insumos
Route::prefix('insumos')->group(function () {
    Route::get('/', [InsumoController::class, 'index'])->name('insumos.index');
    Route::post('/', [InsumoController::class, 'store'])->name('insumos.store');
    Route::get('/unidades', [InsumoController::class, 'unidades'])->name('insumos.unidades');
    Route::get('/{insumo}', [InsumoController::class, 'show'])->name('insumos.show');
    Route::put('/{insumo}', [InsumoController::class, 'update'])->name('insumos.update');
    Route::patch('/{insumo}', [InsumoController::class, 'update'])->name('insumos.update');
    Route::delete('/{insumo}', [InsumoController::class, 'destroy'])->name('insumos.destroy');
});

// Rutas de Productos
Route::prefix('productos')->group(function () {
    Route::get('/', [ProductoController::class, 'index'])->name('productos.index');
    Route::post('/', [ProductoController::class, 'store'])->name('productos.store');
    Route::get('/{producto}', [ProductoController::class, 'show'])->name('productos.show');
    Route::put('/{producto}', [ProductoController::class, 'update'])->name('productos.update');
    Route::patch('/{producto}', [ProductoController::class, 'update'])->name('productos.update');
    Route::delete('/{producto}', [ProductoController::class, 'destroy'])->name('productos.destroy');
    Route::post('/{producto}/recalcular', [ProductoController::class, 'recalcularTotales'])->name('productos.recalcular');
    Route::get('/{producto}/detalle-costos', [ProductoController::class, 'detalleCostos'])->name('productos.detalle-costos');

    // Rutas para gestionar insumos de un producto
    Route::post('/{producto}/insumos', [ProductoController::class, 'agregarInsumo'])->name('productos.insumos.store');
    Route::put('/{producto}/insumos/{insumo}', [ProductoController::class, 'actualizarInsumo'])->name('productos.insumos.update');
    Route::delete('/{producto}/insumos/{insumo}', [ProductoController::class, 'eliminarInsumo'])->name('productos.insumos.destroy');
});
