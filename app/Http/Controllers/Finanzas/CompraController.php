<?php

namespace App\Http\Controllers\Finanzas;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Finanzas\Concerns\ResolvesFinanzasPeriodo;
use App\Models\Compra;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompraController extends Controller
{
    use ResolvesFinanzasPeriodo;

    public function index(Request $request): Response
    {
        $periodo = $this->periodo($request);

        $compras = Compra::query()
            ->whereYear('fecha', $periodo->anio)
            ->whereMonth('fecha', $periodo->mes)
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Compra $c) => [
                'id' => $c->id,
                'fecha' => $c->fecha->format('Y-m-d'),
                'nombre' => $c->nombre,
                'descripcion' => $c->descripcion,
                'efectivo' => $c->efectivo,
                'transferencia' => $c->transferencia,
                'total' => $c->total,
            ]);

        return Inertia::render('finanzas/compras', [
            ...$this->periodoProps($periodo),
            'compras' => $compras,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $periodo = $this->periodo($request);
        Compra::create($this->validateMovimiento($request));

        return $this->redirectWithPeriodo('finanzas.compras.index', $periodo)
            ->with('success', 'Compra registrada.');
    }

    public function update(Request $request, Compra $compra): RedirectResponse
    {
        $periodo = $this->periodo($request);
        $compra->update($this->validateMovimiento($request));

        return $this->redirectWithPeriodo('finanzas.compras.index', $periodo)
            ->with('success', 'Compra actualizada.');
    }

    public function destroy(Request $request, Compra $compra): RedirectResponse
    {
        $periodo = $this->periodo($request);
        $compra->delete();

        return $this->redirectWithPeriodo('finanzas.compras.index', $periodo)
            ->with('success', 'Compra eliminada.');
    }

    /** @return array<string, mixed> */
    private function validateMovimiento(Request $request): array
    {
        return $request->validate([
            'fecha' => 'required|date',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:2000',
            'efectivo' => 'required|integer|min:0',
            'transferencia' => 'required|integer|min:0',
        ]);
    }
}
