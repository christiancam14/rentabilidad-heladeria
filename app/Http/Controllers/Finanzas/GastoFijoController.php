<?php

namespace App\Http\Controllers\Finanzas;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Finanzas\Concerns\ResolvesFinanzasPeriodo;
use App\Models\ConceptoGastoFijo;
use App\Models\GastoFijoMes;
use App\Models\Sede;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GastoFijoController extends Controller
{
    use ResolvesFinanzasPeriodo;

    public function index(Request $request): Response
    {
        $periodo = $this->periodo($request);
        $sedeId = (int) $request->input('sede_id', Sede::orderBy('nombre')->value('id'));

        $sedes = Sede::orderBy('nombre')->get(['id', 'nombre']);

        $conceptos = ConceptoGastoFijo::with(['valoresMes' => function ($q) use ($periodo) {
            $q->where('anio', $periodo->anio)->where('mes', $periodo->mes);
        }])
            ->where('sede_id', $sedeId)
            ->orderBy('nombre')
            ->get()
            ->map(function (ConceptoGastoFijo $concepto) {
                $valorMes = $concepto->valoresMes->first();

                return [
                    'id' => $concepto->id,
                    'nombre' => $concepto->nombre,
                    'valor' => $valorMes?->valor ?? 0,
                    'gasto_mes_id' => $valorMes?->id,
                ];
            });

        $totalSede = $conceptos->sum('valor');

        return Inertia::render('finanzas/gastos-fijos', [
            ...$this->periodoProps($periodo),
            'sedes' => $sedes,
            'sede_id' => $sedeId,
            'conceptos' => $conceptos,
            'total_sede' => $totalSede,
        ]);
    }

    public function storeConcepto(Request $request): RedirectResponse
    {
        $periodo = $this->periodo($request);

        $data = $request->validate([
            'sede_id' => 'required|exists:sedes,id',
            'nombre' => 'required|string|max:255',
        ]);

        ConceptoGastoFijo::create($data);

        return redirect()->route('finanzas.gastos-fijos.index', [
            ...$periodo->toArray(),
            'sede_id' => $data['sede_id'],
        ])->with('success', 'Concepto agregado.');
    }

    public function destroyConcepto(Request $request, ConceptoGastoFijo $concepto): RedirectResponse
    {
        $periodo = $this->periodo($request);
        $sedeId = $concepto->sede_id;
        $concepto->delete();

        return redirect()->route('finanzas.gastos-fijos.index', [
            ...$periodo->toArray(),
            'sede_id' => $sedeId,
        ])->with('success', 'Concepto eliminado.');
    }

    public function upsertValor(Request $request): RedirectResponse
    {
        $periodo = $this->periodo($request);

        $data = $request->validate([
            'concepto_gasto_fijo_id' => 'required|exists:conceptos_gasto_fijo,id',
            'valor' => 'required|integer|min:0',
            'sede_id' => 'required|exists:sedes,id',
        ]);

        GastoFijoMes::updateOrCreate(
            [
                'concepto_gasto_fijo_id' => $data['concepto_gasto_fijo_id'],
                'anio' => $periodo->anio,
                'mes' => $periodo->mes,
            ],
            ['valor' => $data['valor']],
        );

        return redirect()->route('finanzas.gastos-fijos.index', [
            ...$periodo->toArray(),
            'sede_id' => $data['sede_id'],
        ])->with('success', 'Valor guardado.');
    }
}
