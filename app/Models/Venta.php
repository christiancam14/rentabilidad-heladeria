<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Venta extends Model
{
    protected $fillable = [
        'sede_id',
        'fecha',
        'nombre',
        'descripcion',
        'efectivo',
        'transferencia',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'efectivo' => 'integer',
            'transferencia' => 'integer',
        ];
    }

    public function sede(): BelongsTo
    {
        return $this->belongsTo(Sede::class);
    }

    public function getTotalAttribute(): int
    {
        return $this->efectivo + $this->transferencia;
    }

    public static function calcularTotal(int $efectivo, int $transferencia): int
    {
        return $efectivo + $transferencia;
    }
}
