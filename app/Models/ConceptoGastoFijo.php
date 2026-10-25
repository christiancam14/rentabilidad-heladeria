<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConceptoGastoFijo extends Model
{
    protected $table = 'conceptos_gasto_fijo';

    protected $fillable = [
        'sede_id',
        'nombre',
        'archivado_desde',
    ];

    public function sede(): BelongsTo
    {
        return $this->belongsTo(Sede::class);
    }

    public function valoresMes(): HasMany
    {
        return $this->hasMany(GastoFijoMes::class, 'concepto_gasto_fijo_id');
    }

    /** Conceptos que siguen activos en el periodo indicado. */
    public function scopeVigentesEn(Builder $query, int $anio, int $mes): Builder
    {
        return $query->where(fn ($q) => $q
            ->whereNull('archivado_desde')
            ->orWhere('archivado_desde', '>', $anio * 100 + $mes));
    }
}
