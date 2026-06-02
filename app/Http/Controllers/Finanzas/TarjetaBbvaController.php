<?php

namespace App\Http\Controllers\Finanzas;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Finanzas\Concerns\ResolvesFinanzasPeriodo;
use App\Models\MovimientoTarjeta;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TarjetaBbvaController extends Controller
{
    use ResolvesFinanzasPeriodo;

    public function index(Request $request): Response
    {
        $periodo = $this->periodo($request);

        $mapMovimiento = fn (MovimientoTarjeta $m) => [
            'id' => $m->id,
            'contexto' => $m->contexto,
            'fecha' => $m->fecha->format('Y-m-d'),
            'no_transferencia' => $m->no_transferencia,
            'concepto' => $m->concepto,
            'valor' => $m->valor,
        ];

        $heladeria = MovimientoTarjeta::contexto(MovimientoTarjeta::CONTEXTO_HELADERIA)
            ->enPeriodo($periodo->anio, $periodo->mes)
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->get()
            ->map($mapMovimiento);

        $casa = MovimientoTarjeta::contexto(MovimientoTarjeta::CONTEXTO_CASA)
            ->enPeriodo($periodo->anio, $periodo->mes)
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->get()
            ->map($mapMovimiento);

        $totalHeladeria = $heladeria->sum('valor');
        $totalCasa = $casa->sum('valor');

        return Inertia::render('finanzas/tarjeta-bbva', [
            ...$this->periodoProps($periodo),
            'heladeria' => $heladeria,
            'casa' => $casa,
            'totales' => [
                'heladeria' => $totalHeladeria,
                'casa' => $totalCasa,
                'gastos_mes' => $totalHeladeria + $totalCasa,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $periodo = $this->periodo($request);
        MovimientoTarjeta::create($this->validateMovimiento($request));

        return $this->redirectWithPeriodo('finanzas.tarjeta-bbva.index', $periodo)
            ->with('success', 'Movimiento registrado.');
    }

    public function update(Request $request, MovimientoTarjeta $movimiento): RedirectResponse
    {
        $periodo = $this->periodo($request);
        $movimiento->update($this->validateMovimiento($request));

        return $this->redirectWithPeriodo('finanzas.tarjeta-bbva.index', $periodo)
            ->with('success', 'Movimiento actualizado.');
    }

    public function destroy(Request $request, MovimientoTarjeta $movimiento): RedirectResponse
    {
        $periodo = $this->periodo($request);
        $movimiento->delete();

        return $this->redirectWithPeriodo('finanzas.tarjeta-bbva.index', $periodo)
            ->with('success', 'Movimiento eliminado.');
    }

    /** @return array<string, mixed> */
    private function validateMovimiento(Request $request): array
    {
        return $request->validate([
            'contexto' => ['required', Rule::in([
                MovimientoTarjeta::CONTEXTO_HELADERIA,
                MovimientoTarjeta::CONTEXTO_CASA,
            ])],
            'fecha' => 'required|date',
            'no_transferencia' => 'nullable|string|max:255',
            'concepto' => 'required|string|max:255',
            'valor' => 'required|integer|min:0',
        ]);
    }
}
