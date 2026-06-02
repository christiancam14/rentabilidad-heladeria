<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GastoFijoMes extends Model
{
    protected $table = 'gastos_fijos_mes';

    protected $fillable = [
        'concepto_gasto_fijo_id',
        'anio',
        'mes',
        'valor',
    ];

    protected function casts(): array
    {
        return [
            'anio' => 'integer',
            'mes' => 'integer',
            'valor' => 'integer',
        ];
    }

    public function concepto(): BelongsTo
    {
        return $this->belongsTo(ConceptoGastoFijo::class, 'concepto_gasto_fijo_id');
    }
}
