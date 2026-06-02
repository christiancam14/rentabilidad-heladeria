<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class MovimientoTarjeta extends Model
{
    public const CONTEXTO_HELADERIA = 'heladeria';

    public const CONTEXTO_CASA = 'casa';

    protected $table = 'movimientos_tarjeta';

    protected $fillable = [
        'contexto',
        'fecha',
        'no_transferencia',
        'concepto',
        'valor',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'valor' => 'integer',
        ];
    }

    public function scopeEnPeriodo(Builder $query, int $anio, int $mes): Builder
    {
        return $query->whereYear('fecha', $anio)->whereMonth('fecha', $mes);
    }

    public function scopeContexto(Builder $query, string $contexto): Builder
    {
        return $query->where('contexto', $contexto);
    }
}
