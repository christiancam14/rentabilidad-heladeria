<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class CierreMesProducto extends Pivot
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'cierre_mes_productos';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'cierre_mes_id',
        'producto_id',
        'cantidad_vendida',
        'precio_venta_snapshot',
        'costo_unitario_snapshot',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cantidad_vendida' => 'integer',
            'precio_venta_snapshot' => 'decimal:2',
            'costo_unitario_snapshot' => 'decimal:2',
        ];
    }

    /**
     * Get the cierre mes that owns the pivot.
     */
    public function cierreMes(): BelongsTo
    {
        return $this->belongsTo(CierreMes::class);
    }

    /**
     * Get the producto that owns the pivot.
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    /**
     * Calcular ingresos de este producto (cantidad × precio).
     */
    public function calcularIngresos(): float
    {
        return round($this->cantidad_vendida * $this->precio_venta_snapshot, 2);
    }

    /**
     * Calcular costos de este producto (cantidad × costo unitario).
     */
    public function calcularCostos(): float
    {
        return round($this->cantidad_vendida * $this->costo_unitario_snapshot, 2);
    }

    /**
     * Calcular ganancia de este producto (ingresos - costos).
     */
    public function calcularGanancia(): float
    {
        return round($this->calcularIngresos() - $this->calcularCostos(), 2);
    }
}
