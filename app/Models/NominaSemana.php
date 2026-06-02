<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NominaSemana extends Model
{
    protected $fillable = [
        'empleado_id',
        'anio',
        'mes',
        'semana',
        'dias_turno_completo',
        'valor_turno_completo',
        'dias_medio_turno',
        'valor_medio_turno',
        'pago_semana',
    ];

    protected function casts(): array
    {
        return [
            'anio' => 'integer',
            'mes' => 'integer',
            'semana' => 'integer',
            'dias_turno_completo' => 'integer',
            'valor_turno_completo' => 'integer',
            'dias_medio_turno' => 'integer',
            'valor_medio_turno' => 'integer',
            'pago_semana' => 'integer',
        ];
    }

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class);
    }

    public static function calcularPagoSemana(
        int $diasTurnoCompleto,
        int $valorTurnoCompleto,
        int $diasMedioTurno,
        int $valorMedioTurno,
    ): int {
        return ($diasTurnoCompleto * $valorTurnoCompleto)
            + ($diasMedioTurno * $valorMedioTurno);
    }
}
