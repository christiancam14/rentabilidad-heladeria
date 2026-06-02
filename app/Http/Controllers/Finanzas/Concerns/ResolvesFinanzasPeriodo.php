<?php

namespace App\Http\Controllers\Finanzas\Concerns;

use App\Support\FinanzasPeriodo;
use Illuminate\Http\Request;

trait ResolvesFinanzasPeriodo
{
    protected function periodo(Request $request): FinanzasPeriodo
    {
        return FinanzasPeriodo::fromRequest($request);
    }

    /** @return array<string, mixed> */
    protected function periodoProps(FinanzasPeriodo $periodo): array
    {
        return [
            'periodo' => [
                'anio' => $periodo->anio,
                'mes' => $periodo->mes,
                'nombre_mes' => $periodo->nombreMes(),
            ],
        ];
    }

    protected function redirectWithPeriodo(string $route, FinanzasPeriodo $periodo, ?string $fragment = null): \Illuminate\Http\RedirectResponse
    {
        $url = route($route, $periodo->toArray());
        if ($fragment) {
            $url .= '#'.$fragment;
        }

        return redirect()->to($url);
    }
}
