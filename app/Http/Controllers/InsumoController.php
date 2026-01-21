<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInsumoRequest;
use App\Http\Requests\UpdateInsumoRequest;
use App\Models\Insumo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InsumoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Insumo::query();

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
        $insumos = $query->paginate($perPage)->withQueryString();

        return Inertia::render('insumos/index', [
            'insumos' => $insumos,
            'unidades_disponibles' => Insumo::unidadesDisponibles(),
            'filters' => $request->only(['search', 'sort_by', 'sort_order', 'per_page']),
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
                    'presentacion' => $producto->pivot->presentacion,
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
        $insumo->update($request->validated());

        // Si cambió el precio, recalcular costos en todos los productos que usan este insumo
        if ($insumo->wasChanged('precio')) {
            foreach ($insumo->productos as $producto) {
                $producto->recalcularCostosInsumos();
            }
        }

        return redirect()->route('insumos.index')
            ->with('success', 'Insumo actualizado exitosamente.');
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
