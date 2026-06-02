<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConceptoGastoFijo extends Model
{
    protected $table = 'conceptos_gasto_fijo';

    protected $fillable = [
        'sede_id',
        'nombre',
    ];

    public function sede(): BelongsTo
    {
        return $this->belongsTo(Sede::class);
    }

    public function valoresMes(): HasMany
    {
        return $this->hasMany(GastoFijoMes::class, 'concepto_gasto_fijo_id');
    }
}
