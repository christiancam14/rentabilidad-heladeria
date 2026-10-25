<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInsumoRequest;
use App\Http\Requests\UpdateInsumoRequest;
use App\Models\Insumo;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InsumoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        // Cargar todos los insumos sin paginación para búsqueda en frontend
        // Solo columnas conocidas: un valor arbitrario en la URL no debe romper la consulta
        $sortBy = in_array($request->get('sort_by'), ['nombre', 'precio', 'unidad', 'presentacion', 'created_at', 'updated_at'], true) ? $request->get('sort_by') : 'created_at';
        $sortOrder = $request->get('sort_order') === 'asc' ? 'asc' : 'desc';
        $insumos = Insumo::orderBy($sortBy, $sortOrder)->get();

        return Inertia::render('insumos/index', [
            'insumos' => $insumos,
            'unidades_disponibles' => Insumo::unidadesDisponibles(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('insumos/create', [
            'unidades_disponibles' => Insumo::unidadesDisponibles(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInsumoRequest $request): RedirectResponse
    {
        Insumo::create($request->validated());

        return redirect()->route('insumos.index')
            ->with('success', 'Insumo creado exitosamente.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Insumo $insumo): Response
    {
        $insumo->load('productos');

        return Inertia::render('insumos/edit', [
            'insumo' => $insumo,
            'unidades_disponibles' => Insumo::unidadesDisponibles(),
            'productos_que_usan' => $insumo->productos->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'cantidad_preparacion' => $producto->pivot->cantidad_preparacion,
                    'costo_preparacion' => $producto->pivot->costo_preparacion,
                ];
            }),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInsumoRequest $request, Insumo $insumo): RedirectResponse
    {
        $precioAnterior = $insumo->precio;
        $presentacionAnterior = $insumo->presentacion;
        $insumo->update($request->validated());

        // Si cambió el precio o la presentación, recalcular costos en todos los productos que usan este insumo
        $insumo->refresh();
        if ($precioAnterior != $insumo->precio || $presentacionAnterior != $insumo->presentacion) {
            $this->recalcularProductosAfectados($insumo);
        }

        return redirect()->route('insumos.index')
            ->with('success', 'Insumo actualizado exitosamente.');
    }

    /**
     * Recalcular costos de todos los productos que usan un insumo de forma optimizada.
     */
    private function recalcularProductosAfectados(Insumo $insumo): void
    {
        // Obtener todos los productos que usan este insumo con una sola consulta
        $productosIds = $insumo->productos()->pluck('productos.id');

        if ($productosIds->isEmpty()) {
            return;
        }

        // Misma fórmula que Producto::agregarInsumo: el valor por unidad se usa sin redondear
        // y solo se redondea el costo final, para que el resultado no dependa de cómo se recalculó.
        $presentacion = (float) ($insumo->presentacion ?? 0);
        $valorUnidad = $presentacion > 0 ? $insumo->precio / $presentacion : 0;

        $lineas = DB::table('insumo_producto')
            ->where('insumo_id', $insumo->id)
            ->get(['id', 'cantidad_preparacion']);

        DB::transaction(function () use ($lineas, $valorUnidad) {
            foreach ($lineas as $linea) {
                DB::table('insumo_producto')->where('id', $linea->id)->update([
                    'valor_unidad' => round($valorUnidad, 2),
                    'costo_preparacion' => round($valorUnidad * (float) $linea->cantidad_preparacion, 2),
                ]);
            }
        });

        // Recalcular totales de todos los productos afectados usando consultas optimizadas
        // Obtener todos los costos de preparación agrupados por producto
        $costosPorProducto = DB::table('insumo_producto')
            ->whereIn('producto_id', $productosIds)
            ->select('producto_id', DB::raw('SUM(costo_preparacion) as costo_total'))
            ->groupBy('producto_id')
            ->pluck('costo_total', 'producto_id');

        // Obtener productos con sus precios de venta
        $productos = Producto::whereIn('id', $productosIds)
            ->select('id', 'precio_venta_publico')
            ->get();

        // Actualizar todos los productos en batch
        DB::transaction(function () use ($productos, $costosPorProducto) {
            foreach ($productos as $producto) {
                $costoTotal = $costosPorProducto[$producto->id] ?? 0;
                $ganancia = $producto->precio_venta_publico - $costoTotal;
                $porcentajeRentabilidad = $producto->precio_venta_publico > 0
                    ? ($ganancia / $producto->precio_venta_publico) * 100
                    : 0;

                DB::table('productos')
                    ->where('id', $producto->id)
                    ->update([
                        'costo_total' => round($costoTotal, 2),
                        'ganancia' => round($ganancia, 2),
                        'porcentaje_rentabilidad' => round($porcentajeRentabilidad, 2),
                    ]);
            }
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Insumo $insumo): RedirectResponse
    {
        // Verificar si el insumo está siendo usado en algún producto
        if ($insumo->productos()->count() > 0) {
            return redirect()->route('insumos.index')
                ->with('error', 'No se puede eliminar el insumo porque está siendo usado en uno o más productos.');
        }

        $insumo->delete();

        return redirect()->route('insumos.index')
            ->with('success', 'Insumo eliminado exitosamente.');
    }
}
