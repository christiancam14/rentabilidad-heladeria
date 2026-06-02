<?php

namespace App\Http\Controllers\Finanzas;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Finanzas\Concerns\ResolvesFinanzasPeriodo;
use App\Models\Empleado;
use App\Models\NominaSemana;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NominaController extends Controller
{
    use ResolvesFinanzasPeriodo;

    public function index(Request $request): Response
    {
        $periodo = $this->periodo($request);

        $empleados = Empleado::where('activo', true)
            ->orderBy('nombre')
            ->get();

        $semanasPorEmpleado = NominaSemana::query()
            ->where('anio', $periodo->anio)
            ->where('mes', $periodo->mes)
            ->get()
            ->groupBy('empleado_id');

        $filas = $empleados->map(function (Empleado $empleado) use ($semanasPorEmpleado) {
            $semanas = collect(range(1, 4))->map(function (int $num) use ($empleado, $semanasPorEmpleado) {
                $registro = $semanasPorEmpleado->get($empleado->id)?->firstWhere('semana', $num);

                return [
                    'semana' => $num,
                    'id' => $registro?->id,
                    'dias_turno_completo' => $registro?->dias_turno_completo ?? 0,
                    'valor_turno_completo' => $registro?->valor_turno_completo ?? $empleado->valor_turno_completo ?? 0,
                    'dias_medio_turno' => $registro?->dias_medio_turno ?? 0,
                    'valor_medio_turno' => $registro?->valor_medio_turno ?? $empleado->valor_medio_turno ?? 0,
                    'pago_semana' => $registro?->pago_semana ?? 0,
                ];
            });

            return [
                'id' => $empleado->id,
                'nombre' => $empleado->nombre,
                'valor_turno_completo_default' => $empleado->valor_turno_completo,
                'valor_medio_turno_default' => $empleado->valor_medio_turno,
                'semanas' => $semanas->values()->all(),
                'total_mes' => $semanas->sum('pago_semana'),
            ];
        });

        $totalNomina = $filas->sum('total_mes');

        return Inertia::render('finanzas/nomina', [
            ...$this->periodoProps($periodo),
            'filas' => $filas->values()->all(),
            'total_nomina' => $totalNomina,
        ]);
    }

    public function storeEmpleado(Request $request): RedirectResponse
    {
        $periodo = $this->periodo($request);

        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'valor_turno_completo' => 'nullable|integer|min:0',
            'valor_medio_turno' => 'nullable|integer|min:0',
        ]);

        Empleado::create([
            'nombre' => $data['nombre'],
            'valor_turno_completo' => $data['valor_turno_completo'] ?? null,
            'valor_medio_turno' => $data['valor_medio_turno'] ?? null,
            'activo' => true,
        ]);

        return $this->redirectWithPeriodo('finanzas.nomina.index', $periodo)
            ->with('success', 'Empleado agregado.');
    }

    public function updateEmpleado(Request $request, Empleado $empleado): RedirectResponse
    {
        $periodo = $this->periodo($request);

        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'valor_turno_completo' => 'nullable|integer|min:0',
            'valor_medio_turno' => 'nullable|integer|min:0',
        ]);

        $empleado->update([
            'nombre' => $data['nombre'],
            'valor_turno_completo' => $data['valor_turno_completo'] ?? null,
            'valor_medio_turno' => $data['valor_medio_turno'] ?? null,
        ]);

        return $this->redirectWithPeriodo('finanzas.nomina.index', $periodo)
            ->with('success', 'Empleado actualizado.');
    }

    public function destroyEmpleado(Request $request, Empleado $empleado): RedirectResponse
    {
        $periodo = $this->periodo($request);
        $empleado->update(['activo' => false]);

        return $this->redirectWithPeriodo('finanzas.nomina.index', $periodo)
            ->with('success', 'Empleado desactivado.');
    }

    public function upsertSemana(Request $request): RedirectResponse
    {
        $periodo = $this->periodo($request);

        $data = $request->validate([
            'empleado_id' => 'required|exists:empleados,id',
            'semana' => 'required|integer|min:1|max:4',
            'dias_turno_completo' => 'required|integer|min:0',
            'valor_turno_completo' => 'required|integer|min:0',
            'dias_medio_turno' => 'required|integer|min:0',
            'valor_medio_turno' => 'required|integer|min:0',
        ]);

        $pago = NominaSemana::calcularPagoSemana(
            $data['dias_turno_completo'],
            $data['valor_turno_completo'],
            $data['dias_medio_turno'],
            $data['valor_medio_turno'],
        );

        NominaSemana::updateOrCreate(
            [
                'empleado_id' => $data['empleado_id'],
                'anio' => $periodo->anio,
                'mes' => $periodo->mes,
                'semana' => $data['semana'],
            ],
            [
                'dias_turno_completo' => $data['dias_turno_completo'],
                'valor_turno_completo' => $data['valor_turno_completo'],
                'dias_medio_turno' => $data['dias_medio_turno'],
                'valor_medio_turno' => $data['valor_medio_turno'],
                'pago_semana' => $pago,
            ],
        );

        return $this->redirectWithPeriodo('finanzas.nomina.index', $periodo)
            ->with('success', 'Semana guardada.');
    }
}
