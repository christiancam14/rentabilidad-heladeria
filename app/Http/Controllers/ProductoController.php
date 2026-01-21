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
        $query = Producto::with('insumos');

        // Búsqueda por nombre
        if ($request->has('search') && $request->search) {
            $query->where('nombre', 'like', '%'.$request->search.'%');
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginación
        $perPage = $request->get('per_page', 15);
        $productos = $query->paginate($perPage)->withQueryString();

        return Inertia::render('productos/index', [
            'productos' => $productos,
            'filters' => $request->only(['search', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('productos/create');
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
     * Show the form for editing the specified resource.
     */
    public function edit(Producto $producto): Response
    {
        return Inertia::render('productos/edit', [
            'producto' => $producto,
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
            $request->presentacion,
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
            $request->presentacion,
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
