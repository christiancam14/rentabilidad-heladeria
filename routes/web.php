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
});

require __DIR__.'/settings.php';
