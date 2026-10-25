<?php

namespace App\Http\Controllers;

use App\Http\Requests\AgregarInsumoProductoRequest;
use App\Http\Requests\StoreProductoRequest;
use App\Http\Requests\UpdateProductoRequest;
use App\Models\Insumo;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        // Cargar todos los productos sin paginación para búsqueda en frontend
        // Solo columnas conocidas: un valor arbitrario en la URL no debe romper la consulta
        $sortBy = in_array($request->get('sort_by'), ['nombre', 'precio_venta_publico', 'costo_total', 'ganancia', 'porcentaje_rentabilidad', 'created_at', 'updated_at'], true) ? $request->get('sort_by') : 'created_at';
        $sortOrder = $request->get('sort_order') === 'asc' ? 'asc' : 'desc';
        $productos = Producto::with('insumos')
            ->orderBy($sortBy, $sortOrder)
            ->get();

        return Inertia::render('productos/index', [
            'productos' => $productos,
            'filters' => $request->only(['sort_by', 'sort_order']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductoRequest $request): RedirectResponse
    {
        $producto = Producto::create([
            'nombre' => $request->nombre,
            'precio_venta_publico' => $request->precio_venta_publico,
            'costo_total' => 0,
            'ganancia' => $request->precio_venta_publico,
            'porcentaje_rentabilidad' => 100,
        ]);

        return redirect()->route('productos.show', $producto)
            ->with('success', 'Producto creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Producto $producto): Response
    {
        $producto->load('insumos');
        $insumos = Insumo::all();

        return Inertia::render('productos/show', [
            'producto' => $producto,
            'insumos' => $insumos,
            'detalle_costos' => $producto->getDetalleCostos(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductoRequest $request, Producto $producto): RedirectResponse
    {
        $producto->update($request->validated());

        // Recalcular totales si cambió el precio de venta
        if ($producto->wasChanged('precio_venta_publico')) {
            $producto->recalcularTotales();
        }

        return redirect()->route('productos.show', $producto)
            ->with('success', 'Producto actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Producto $producto): RedirectResponse
    {
        if ($producto->tieneVentasRegistradas()) {
            return back()->withErrors(['producto' => 'No se puede eliminar: tiene ventas registradas en cierres de mes. Ocúltalo del menú para dejar de venderlo.']);
        }

        $producto->delete();

        return redirect()->route('productos.index')
            ->with('success', 'Producto eliminado exitosamente.');
    }

    /**
     * Agregar un insumo a un producto.
     */
    public function agregarInsumo(AgregarInsumoProductoRequest $request, Producto $producto): RedirectResponse
    {
        $insumo = Insumo::findOrFail($request->insumo_id);

        $producto->agregarInsumo(
            $insumo,
            $request->cantidad_preparacion
        );

        return redirect()->back()
            ->with('success', 'Insumo agregado al producto exitosamente.');
    }

    /**
     * Actualizar un insumo de un producto.
     */
    public function actualizarInsumo(AgregarInsumoProductoRequest $request, Producto $producto, Insumo $insumo): RedirectResponse
    {
        $producto->actualizarInsumo(
            $insumo,
            $request->cantidad_preparacion
        );

        return redirect()->back()
            ->with('success', 'Insumo actualizado exitosamente.');
    }

    /**
     * Eliminar un insumo de un producto.
     */
    public function eliminarInsumo(Producto $producto, Insumo $insumo): RedirectResponse
    {
        $producto->eliminarInsumo($insumo);

        return redirect()->back()
            ->with('success', 'Insumo eliminado del producto exitosamente.');
    }

    /**
     * Recalcular los totales de un producto.
     */
    public function recalcularTotales(Producto $producto): RedirectResponse
    {
        $producto->recalcularTotales();

        return redirect()->back()
            ->with('success', 'Totales recalculados exitosamente.');
    }
}
