<?php

namespace App\Http\Controllers;

use App\Models\Insumo;
use App\Models\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with analytics.
     */
    public function index(): Response
    {
        // KPIs principales
        $totalProductos = Producto::count();
        $totalInsumos = Insumo::count();
        $productosIncompletos = Producto::doesntHave('insumos')->count();
        
        // Rentabilidad promedio
        $rentabilidadPromedio = Producto::whereHas('insumos')
            ->avg('porcentaje_rentabilidad') ?? 0;

        // Top 5 productos más rentables (por porcentaje)
        $topProductosRentabilidad = Producto::with('insumos')
            ->whereHas('insumos')
            ->orderBy('porcentaje_rentabilidad', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'precio_venta_publico' => $producto->precio_venta_publico,
                    'costo_total' => $producto->costo_total,
                    'ganancia' => $producto->ganancia,
                    'porcentaje_rentabilidad' => $producto->porcentaje_rentabilidad,
                ];
            });

        // Top 5 productos por ganancia absoluta
        $topProductosGanancia = Producto::with('insumos')
            ->whereHas('insumos')
            ->orderBy('ganancia', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'precio_venta_publico' => $producto->precio_venta_publico,
                    'costo_total' => $producto->costo_total,
                    'ganancia' => $producto->ganancia,
                    'porcentaje_rentabilidad' => $producto->porcentaje_rentabilidad,
                ];
            });

        // Productos que requieren atención
        $productosBajaRentabilidad = Producto::with('insumos')
            ->whereHas('insumos')
            ->where('porcentaje_rentabilidad', '<', 40)
            ->where('porcentaje_rentabilidad', '>=', 0)
            ->orderBy('porcentaje_rentabilidad', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'precio_venta_publico' => $producto->precio_venta_publico,
                    'costo_total' => $producto->costo_total,
                    'ganancia' => $producto->ganancia,
                    'porcentaje_rentabilidad' => $producto->porcentaje_rentabilidad,
                ];
            });

        $productosSinInsumos = Producto::doesntHave('insumos')
            ->limit(10)
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'precio_venta_publico' => $producto->precio_venta_publico,
                ];
            });

        $productosRentabilidadNegativa = Producto::with('insumos')
            ->whereHas('insumos')
            ->where('ganancia', '<', 0)
            ->orderBy('ganancia', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'precio_venta_publico' => $producto->precio_venta_publico,
                    'costo_total' => $producto->costo_total,
                    'ganancia' => $producto->ganancia,
                    'porcentaje_rentabilidad' => $producto->porcentaje_rentabilidad,
                ];
            });

        // Estadísticas financieras
        $valorTotalInventario = Insumo::sum('precio');
        $gananciaPotencialTotal = Producto::whereHas('insumos')->sum('ganancia');
        $valorVentaPublicoTotal = Producto::sum('precio_venta_publico');

        // Promedio de insumos por producto
        $promedioInsumosPorProducto = Producto::whereHas('insumos')
            ->withCount('insumos')
            ->get()
            ->avg('insumos_count') ?? 0;

        // Distribución de rentabilidad
        $distribucionRentabilidad = [
            'excelente' => Producto::whereHas('insumos')
                ->where('porcentaje_rentabilidad', '>=', 60)
                ->count(),
            'media' => Producto::whereHas('insumos')
                ->whereBetween('porcentaje_rentabilidad', [40, 59.99])
                ->count(),
            'baja' => Producto::whereHas('insumos')
                ->where('porcentaje_rentabilidad', '>=', 0)
                ->where('porcentaje_rentabilidad', '<', 40)
                ->count(),
            'negativa' => Producto::whereHas('insumos')
                ->where('ganancia', '<', 0)
                ->count(),
        ];

        // Insumos más utilizados
        $insumosMasUtilizados = Insumo::withCount('productos')
            ->orderBy('productos_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($insumo) {
                return [
                    'id' => $insumo->id,
                    'nombre' => $insumo->nombre,
                    'precio' => $insumo->precio,
                    'unidad' => $insumo->unidad,
                    'productos_count' => $insumo->productos_count,
                ];
            });

        return Inertia::render('dashboard', [
            'kpis' => [
                'total_productos' => $totalProductos,
                'total_insumos' => $totalInsumos,
                'productos_incompletos' => $productosIncompletos,
                'rentabilidad_promedio' => round($rentabilidadPromedio, 2),
            ],
            'top_productos_rentabilidad' => $topProductosRentabilidad,
            'top_productos_ganancia' => $topProductosGanancia,
            'productos_requieren_atencion' => [
                'baja_rentabilidad' => $productosBajaRentabilidad,
                'sin_insumos' => $productosSinInsumos,
                'rentabilidad_negativa' => $productosRentabilidadNegativa,
            ],
            'estadisticas_financieras' => [
                'valor_total_inventario' => $valorTotalInventario,
                'ganancia_potencial_total' => $gananciaPotencialTotal,
                'valor_venta_publico_total' => $valorVentaPublicoTotal,
            ],
            'metricas_adicionales' => [
                'promedio_insumos_por_producto' => round($promedioInsumosPorProducto, 2),
            ],
            'distribucion_rentabilidad' => $distribucionRentabilidad,
            'insumos_mas_utilizados' => $insumosMasUtilizados,
        ]);
    }
}
