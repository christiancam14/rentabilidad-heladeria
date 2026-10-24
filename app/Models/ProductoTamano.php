<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoTamano extends Model
{
    protected $fillable = [
        'producto_id',
        'nombre',
        'ajuste_precio',
        'activo',
        'orden',
    ];

    protected function casts(): array
    {
        return [
            'ajuste_precio' => 'integer',
            'activo' => 'boolean',
            'orden' => 'integer',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
