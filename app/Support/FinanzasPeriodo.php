<?php

namespace App\Support;

use Illuminate\Http\Request;

class FinanzasPeriodo
{
    public function __construct(
        public int $anio,
        public int $mes,
    ) {}

    public static function fromRequest(Request $request): self
    {
        $anio = (int) $request->input('anio', now()->year);
        $mes = (int) $request->input('mes', now()->month);

        $mes = max(1, min(12, $mes));

        return new self($anio, $mes);
    }

    public function nombreMes(): string
    {
        $meses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre',
        ];

        return $meses[$this->mes] ?? '';
    }

    /** @return array{anio: int, mes: int} */
    public function toArray(): array
    {
        return [
            'anio' => $this->anio,
            'mes' => $this->mes,
        ];
    }
}
