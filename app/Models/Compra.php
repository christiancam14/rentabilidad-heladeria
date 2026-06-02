<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compra extends Model
{
    protected $fillable = [
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

    public function getTotalAttribute(): int
    {
        return $this->efectivo + $this->transferencia;
    }

    public static function calcularTotal(int $efectivo, int $transferencia): int
    {
        return $efectivo + $transferencia;
    }
}
