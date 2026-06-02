<?php

namespace App\Http\Controllers\Finanzas;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Finanzas\Concerns\ResolvesFinanzasPeriodo;
use App\Services\FinanzasConsolidadoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsolidadoController extends Controller
{
    use ResolvesFinanzasPeriodo;

    public function __construct(
        private FinanzasConsolidadoService $consolidadoService,
    ) {}

    public function index(Request $request): Response
    {
        $periodo = $this->periodo($request);
        $consolidado = $this->consolidadoService->calcular($periodo);

        return Inertia::render('finanzas/consolidado', [
            ...$this->periodoProps($periodo),
            'consolidado' => $consolidado,
        ]);
    }
}
