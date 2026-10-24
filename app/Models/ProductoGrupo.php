<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Grupo de opciones que el cliente personaliza (p. ej. "Elige 2 sabores", "Adicionales").
 */
class ProductoGrupo extends Model
{
    protected $fillable = [
        'producto_id',
        'nombre',
        'tipo',
        'obligatorio',
        'max_selecciones',
        'orden',
    ];

    protected function casts(): array
    {
        return [
            'obligatorio' => 'boolean',
            'max_selecciones' => 'integer',
            'orden' => 'integer',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function opciones(): BelongsToMany
    {
        return $this->belongsToMany(Opcion::class, 'opcion_producto_grupo')
            ->withPivot('activo')
            ->orderBy('opciones.orden')
            ->orderBy('opciones.nombre');
    }
}
