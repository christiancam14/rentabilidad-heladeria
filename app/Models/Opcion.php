<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Sabor o adicional de la biblioteca global, reutilizable en los grupos de cada producto.
 */
class Opcion extends Model
{
    protected $table = 'opciones';

    public const TIPOS = ['sabor', 'adicional'];

    protected $fillable = [
        'tipo',
        'nombre',
        'precio',
        'disponible',
        'orden',
    ];

    protected function casts(): array
    {
        return [
            'precio' => 'integer',
            'disponible' => 'boolean',
            'orden' => 'integer',
        ];
    }
}
