<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cupon extends Model
{
    protected $table = 'cupones';

    protected $fillable = [
        'codigo',
        'descripcion',
        'porcentaje',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'porcentaje' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public static function buscarActivo(?string $codigo): ?self
    {
        if (! $codigo) {
            return null;
        }

        return static::where('codigo', strtoupper(trim($codigo)))->where('activo', true)->first();
    }
}
