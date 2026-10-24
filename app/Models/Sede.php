<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sede extends Model
{
    protected $fillable = [
        'nombre',
        'slug',
        'direccion',
        'whatsapp',
        'tiempo_preparacion',
        'recibiendo_pedidos',
        'en_menu',
        'horarios',
    ];

    /** Horarios por defecto para sedes nuevas. */
    public const HORARIOS_DEFAULT = [
        ['dias' => 'Lunes a jueves', 'abre' => '14:00', 'cierra' => '22:00', 'activo' => true],
        ['dias' => 'Viernes y sábado', 'abre' => '14:00', 'cierra' => '23:00', 'activo' => true],
        ['dias' => 'Domingo y festivos', 'abre' => '14:00', 'cierra' => '21:00', 'activo' => true],
    ];

    protected function casts(): array
    {
        return [
            'tiempo_preparacion' => 'integer',
            'recibiendo_pedidos' => 'boolean',
            'en_menu' => 'boolean',
            'horarios' => 'array',
        ];
    }

    public function pedidos(): HasMany
    {
        return $this->hasMany(Pedido::class);
    }

    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class);
    }

    public function conceptosGastoFijo(): HasMany
    {
        return $this->hasMany(ConceptoGastoFijo::class);
    }
}
