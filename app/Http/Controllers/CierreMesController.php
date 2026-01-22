<?php

namespace App\Http\Controllers;

use App\Http\Requests\AgregarProductoCierreRequest;
use App\Http\Requests\StoreCierreMesRequest;
use App\Http\Requests\StoreGastoCierreRequest;
use App\Models\CierreMes;
use App\Models\GastoCierreMes;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CierreMesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = CierreMes::with('productosVendidos.producto', 'gastosItems');

        // Búsqueda por año
        if ($request->has('anio') && $request->anio) {
            $query->where('anio', $request->anio);
        }

        // Ordenamiento: más reciente primero
        $query->orderBy('anio', 'desc')
            ->orderBy('mes', 'desc');

        // Paginación
        $perPage = $request->get('per_page', 15);
        $cierres = $query->paginate($perPage)->withQueryString();

        // Calcular métricas para cada cierre
        $cierres->getCollection()->transform(function ($cierre) {
            $cierre->ingresos = $cierre->calcularIngresos();
            $cierre->costos = $cierre->calcularCostos();
            $cierre->total_gastos = $cierre->calcularTotalGastos();
            $cierre->ganancia_bruta = $cierre->calcularGananciaBruta();
            $cierre->ganancia_neta = $cierre->calcularGananciaNeta();
            return $cierre;
        });

        // Obtener años disponibles para filtro
        $anios = CierreMes::select('anio')
            ->distinct()
            ->orderBy('anio', 'desc')
            ->pluck('anio');

        return Inertia::render('cierres-mes/index', [
            'cierres' => $cierres,
            'anios' => $anios,
            'filters' => $request->only(['anio', 'per_page']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCierreMesRequest $request): RedirectResponse
    {
        $cierre = CierreMes::create($request->validated());

        return redirect()->to("/cierres-mes/{$cierre->id}")
            ->with('success', 'Cierre de mes creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CierreMes $cierreMes): Response
    {
        $cierreMes->load('productosVendidos.producto', 'gastosItems');

        // Calcular métricas
        $ingresos = $cierreMes->calcularIngresos();
        $costos = $cierreMes->calcularCostos();
        $gananciaBruta = $cierreMes->calcularGananciaBruta();
        $totalGastos = $cierreMes->calcularTotalGastos();
        $gananciaNeta = $cierreMes->calcularGananciaNeta();

        // Obtener todos los productos para el select
        $productos = Producto::orderBy('nombre')->get();

        // Formatear productos vendidos para la vista
        $productosVendidos = $cierreMes->productosVendidos->map(function ($pivot) {
            return [
                'id' => $pivot->id,
                'producto' => $pivot->producto,
                'pivot' => [
                    'cantidad_vendida' => $pivot->cantidad_vendida,
                    'precio_venta_snapshot' => $pivot->precio_venta_snapshot,
                    'costo_unitario_snapshot' => $pivot->costo_unitario_snapshot,
                ],
            ];
        });

        // Asegurar que todos los campos necesarios estén presentes, incluyendo el ID
        $cierreArray = [
            'id' => $cierreMes->id,
            'nombre' => $cierreMes->nombre,
            'anio' => (int) ($cierreMes->anio ?? date('Y')),
            'mes' => (int) ($cierreMes->mes ?? date('n')),
            'created_at' => $cierreMes->created_at,
            'updated_at' => $cierreMes->updated_at,
        ];
        $cierreArray['productos_vendidos'] = $productosVendidos;
        $cierreArray['gastos'] = $cierreMes->gastosItems->toArray();

        return Inertia::render('cierres-mes/show', [
            'cierre' => $cierreArray,
            'productos' => $productos,
            'ingresos' => $ingresos,
            'costos' => $costos,
            'total_gastos' => $totalGastos,
            'ganancia_bruta' => $gananciaBruta,
            'ganancia_neta' => $gananciaNeta,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CierreMes $cierreMes): Response
    {
        return Inertia::render('cierres-mes/edit', [
            'cierre' => $cierreMes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreCierreMesRequest $request, CierreMes $cierreMes): RedirectResponse
    {
        // Verificar que el modelo se haya cargado correctamente
        if (!$cierreMes || !$cierreMes->id) {
            return redirect()->route('cierres-mes.index')
                ->withErrors(['error' => 'No se encontró el cierre de mes.']);
        }
        
        // Guardar el ID antes del update
        $cierreId = $cierreMes->id;
        
        // Obtener los datos validados y actualizar
        $validated = $request->validated();
        $cierreMes->nombre = $validated['nombre'] ?? null;
        $cierreMes->anio = $validated['anio'];
        $cierreMes->mes = $validated['mes'];
        $cierreMes->save();

        return redirect()->to("/cierres-mes/{$cierreId}")
            ->with('success', 'Cierre de mes actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CierreMes $cierreMes): RedirectResponse
    {
        $cierreMes->delete();

        return redirect()->route('cierres-mes.index')
            ->with('success', 'Cierre de mes eliminado exitosamente.');
    }

    /**
     * Agregar un producto vendido al cierre.
     */
    public function agregarProducto(AgregarProductoCierreRequest $request, CierreMes $cierreMes): RedirectResponse
    {
        $producto = Producto::findOrFail($request->producto_id);
        $cierreMes->agregarProducto($producto, $request->cantidad_vendida);

        return redirect()->back()
            ->with('success', 'Producto agregado al cierre exitosamente.');
    }

    /**
     * Actualizar la cantidad vendida de un producto en el cierre.
     */
    public function actualizarProducto(AgregarProductoCierreRequest $request, CierreMes $cierreMes, Producto $producto): RedirectResponse
    {
        $cierreMes->agregarProducto($producto, $request->cantidad_vendida);

        return redirect()->back()
            ->with('success', 'Cantidad vendida actualizada exitosamente.');
    }

    /**
     * Eliminar un producto del cierre.
     */
    public function eliminarProducto(CierreMes $cierreMes, Producto $producto): RedirectResponse
    {
        $cierreMes->productos()->detach($producto->id);

        return redirect()->back()
            ->with('success', 'Producto eliminado del cierre exitosamente.');
    }

    /**
     * Agregar un gasto al cierre.
     */
    public function agregarGasto(StoreGastoCierreRequest $request, CierreMes $cierreMes): RedirectResponse
    {
        $cierreMes->gastosItems()->create($request->validated());

        return redirect()->back()
            ->with('success', 'Gasto agregado exitosamente.');
    }

    /**
     * Actualizar un gasto del cierre.
     */
    public function actualizarGasto(StoreGastoCierreRequest $request, CierreMes $cierreMes, GastoCierreMes $gasto): RedirectResponse
    {
        $gasto->update($request->validated());

        return redirect()->back()
            ->with('success', 'Gasto actualizado exitosamente.');
    }

    /**
     * Eliminar un gasto del cierre.
     */
    public function eliminarGasto(CierreMes $cierreMes, GastoCierreMes $gasto): RedirectResponse
    {
        $gasto->delete();

        return redirect()->back()
            ->with('success', 'Gasto eliminado exitosamente.');
    }
}
