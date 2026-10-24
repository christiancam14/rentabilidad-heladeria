<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Pedido extends Model
{
    public const ESTADOS = ['nuevo', 'preparando', 'listo', 'entregado', 'cancelado'];

    /** Estados que cuentan como "en curso" en el panel. */
    public const EN_CURSO = ['nuevo', 'preparando', 'listo'];

    public const METODOS_PAGO = [
        'caja' => 'Caja',
        'transferencia' => 'Transferencia',
        'nequi' => 'Nequi / Daviplata',
    ];

    /**
     * Métodos de pago activos según la configuración.
     *
     * @param  array<string, mixed>  $config
     * @return array<string, string>
     */
    public static function metodosHabilitados(array $config): array
    {
        return array_filter(
            self::METODOS_PAGO,
            fn ($key) => (bool) ($config['pago_'.$key] ?? false),
            ARRAY_FILTER_USE_KEY,
        );
    }

    protected $fillable = [
        'codigo',
        'token',
        'sede_id',
        'cliente_nombre',
        'cliente_telefono',
        'metodo_pago',
        'notas',
        'cupon',
        'regalo',
        'subtotal',
        'descuento',
        'total',
        'estado',
        'listo_estimado',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'descuento' => 'integer',
            'total' => 'integer',
            'listo_estimado' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Pedido $pedido) {
            $pedido->token ??= Str::random(32);
        });

        static::created(function (Pedido $pedido) {
            if (! $pedido->codigo) {
                $pedido->codigo = 'A-'.(100 + $pedido->id);
                $pedido->saveQuietly();
            }
        });
    }

    public function sede(): BelongsTo
    {
        return $this->belongsTo(Sede::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PedidoItem::class);
    }
}
