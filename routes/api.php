<?php

use Illuminate\Support\Facades\Route;

// Las rutas API están comentadas porque estamos usando Inertia para todas las operaciones
// Si necesitas rutas API en el futuro, descomenta y ajusta según sea necesario

// use App\Http\Controllers\InsumoController;
// use App\Http\Controllers\ProductoController;

// // Rutas de Insumos
// Route::prefix('insumos')->group(function () {
//     Route::get('/', [InsumoController::class, 'index'])->name('api.insumos.index');
//     Route::post('/', [InsumoController::class, 'store'])->name('api.insumos.store');
//     Route::get('/unidades', [InsumoController::class, 'unidades'])->name('api.insumos.unidades');
//     Route::get('/{insumo}', [InsumoController::class, 'show'])->name('api.insumos.show');
//     Route::put('/{insumo}', [InsumoController::class, 'update'])->name('api.insumos.update');
//     Route::patch('/{insumo}', [InsumoController::class, 'update'])->name('api.insumos.update');
//     Route::delete('/{insumo}', [InsumoController::class, 'destroy'])->name('api.insumos.destroy');
// });

// // Rutas de Productos
// Route::prefix('productos')->group(function () {
//     Route::get('/', [ProductoController::class, 'index'])->name('api.productos.index');
//     Route::post('/', [ProductoController::class, 'store'])->name('api.productos.store');
//     Route::get('/{producto}', [ProductoController::class, 'show'])->name('api.productos.show');
//     Route::put('/{producto}', [ProductoController::class, 'update'])->name('api.productos.update');
//     Route::patch('/{producto}', [ProductoController::class, 'update'])->name('api.productos.update');
//     Route::delete('/{producto}', [ProductoController::class, 'destroy'])->name('api.productos.destroy');
//     Route::post('/{producto}/recalcular', [ProductoController::class, 'recalcularTotales'])->name('api.productos.recalcular');
//     Route::get('/{producto}/detalle-costos', [ProductoController::class, 'detalleCostos'])->name('api.productos.detalle-costos');

//     // Rutas para gestionar insumos de un producto
//     Route::post('/{producto}/insumos', [ProductoController::class, 'agregarInsumo'])->name('api.productos.insumos.store');
//     Route::put('/{producto}/insumos/{insumo}', [ProductoController::class, 'actualizarInsumo'])->name('api.productos.insumos.update');
//     Route::delete('/{producto}/insumos/{insumo}', [ProductoController::class, 'eliminarInsumo'])->name('api.productos.insumos.destroy');
// });
