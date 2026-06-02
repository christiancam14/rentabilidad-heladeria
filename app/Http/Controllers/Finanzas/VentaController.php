<?php

namespace App\Http\Controllers\Finanzas;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Finanzas\Concerns\ResolvesFinanzasPeriodo;
use App\Models\Sede;
use App\Models\Venta;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VentaController extends Controller
{
    use ResolvesFinanzasPeriodo;

    public function index(Request $request): Response
    {
        $periodo = $this->periodo($request);

        $ventas = Venta::with('sede')
            ->whereYear('fecha', $periodo->anio)
            ->whereMonth('fecha', $periodo->mes)
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Venta $v) => [
                'id' => $v->id,
                'sede_id' => $v->sede_id,
                'sede_nombre' => $v->sede->nombre,
                'fecha' => $v->fecha->format('Y-m-d'),
                'nombre' => $v->nombre,
                'descripcion' => $v->descripcion,
                'efectivo' => $v->efectivo,
                'transferencia' => $v->transferencia,
                'total' => $v->total,
            ]);

        return Inertia::render('finanzas/ventas', [
            ...$this->periodoProps($periodo),
            'ventas' => $ventas,
            'sedes' => Sede::orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $periodo = $this->periodo($request);
        Venta::create($this->validateMovimiento($request));

        return $this->redirectWithPeriodo('finanzas.ventas.index', $periodo)
            ->with('success', 'Venta registrada.');
    }

    public function update(Request $request, Venta $venta): RedirectResponse
    {
        $periodo = $this->periodo($request);
        $venta->update($this->validateMovimiento($request));

        return $this->redirectWithPeriodo('finanzas.ventas.index', $periodo)
            ->with('success', 'Venta actualizada.');
    }

    public function destroy(Request $request, Venta $venta): RedirectResponse
    {
        $periodo = $this->periodo($request);
        $venta->delete();

        return $this->redirectWithPeriodo('finanzas.ventas.index', $periodo)
            ->with('success', 'Venta eliminada.');
    }

    /** @return array<string, mixed> */
    private function validateMovimiento(Request $request): array
    {
        return $request->validate([
            'sede_id' => 'required|exists:sedes,id',
            'fecha' => 'required|date',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:2000',
            'efectivo' => 'required|integer|min:0',
            'transferencia' => 'required|integer|min:0',
        ]);
    }
}
