<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Empleado extends Model
{
    protected $fillable = [
        'nombre',
        'valor_turno_completo',
        'valor_medio_turno',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'valor_turno_completo' => 'integer',
            'valor_medio_turno' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function nominaSemanas(): HasMany
    {
        return $this->hasMany(NominaSemana::class);
    }
}
