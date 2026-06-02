<?php

namespace App\Services;

use App\Models\Compra;
use App\Models\GastoFijoMes;
use App\Models\NominaSemana;
use App\Models\Sede;
use App\Models\Venta;
use App\Support\FinanzasPeriodo;
class FinanzasConsolidadoService
{
    public function calcular(FinanzasPeriodo $periodo): array
    {
        $ventasPorSede = Sede::query()
            ->orderBy('nombre')
            ->get()
            ->map(function (Sede $sede) use ($periodo) {
                $total = Venta::query()
                    ->where('sede_id', $sede->id)
                    ->whereYear('fecha', $periodo->anio)
                    ->whereMonth('fecha', $periodo->mes)
                    ->selectRaw('COALESCE(SUM(efectivo + transferencia), 0) as total')
                    ->value('total');

                return [
                    'sede_id' => $sede->id,
                    'sede_nombre' => $sede->nombre,
                    'total' => (int) $total,
                ];
            });

        $totalEntradas = $ventasPorSede->sum('total');

        $totalCompras = (int) Compra::query()
            ->whereYear('fecha', $periodo->anio)
            ->whereMonth('fecha', $periodo->mes)
            ->selectRaw('COALESCE(SUM(efectivo + transferencia), 0) as total')
            ->value('total');

        $gastosFijosPorSede = Sede::query()
            ->orderBy('nombre')
            ->get()
            ->map(function (Sede $sede) use ($periodo) {
                $total = GastoFijoMes::query()
                    ->where('anio', $periodo->anio)
                    ->where('mes', $periodo->mes)
                    ->whereHas('concepto', fn ($q) => $q->where('sede_id', $sede->id))
                    ->sum('valor');

                return [
                    'sede_id' => $sede->id,
                    'sede_nombre' => $sede->nombre,
                    'total' => (int) $total,
                ];
            });

        $totalGastosFijos = $gastosFijosPorSede->sum('total');

        $totalNomina = (int) NominaSemana::query()
            ->where('anio', $periodo->anio)
            ->where('mes', $periodo->mes)
            ->sum('pago_semana');

        $totalSalidas = $totalCompras + $totalGastosFijos + $totalNomina;
        $ganancia = $totalEntradas - $totalSalidas;

        return [
            'entradas' => [
                'ventas_por_sede' => $ventasPorSede->values()->all(),
                'total' => $totalEntradas,
            ],
            'salidas' => [
                'compras' => $totalCompras,
                'gastos_fijos_por_sede' => $gastosFijosPorSede->values()->all(),
                'gastos_fijos_total' => $totalGastosFijos,
                'nomina' => $totalNomina,
                'total' => $totalSalidas,
            ],
            'ganancia' => $ganancia,
        ];
    }
}
