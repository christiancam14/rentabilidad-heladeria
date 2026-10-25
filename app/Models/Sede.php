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
        'maps_url',
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

    /** Enlace de WhatsApp para escribirle a la sede con un saludo listo. */
    public function whatsappUrl(?string $texto = null): ?string
    {
        $numero = preg_replace('/\D/', '', (string) $this->whatsapp);
        if (! $numero) {
            return null;
        }
        if (strlen($numero) === 10) {
            $numero = '57'.$numero;
        }

        return 'https://wa.me/'.$numero.($texto ? '?text='.rawurlencode($texto) : '');
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
