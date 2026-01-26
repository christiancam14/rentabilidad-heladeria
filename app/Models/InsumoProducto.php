<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class InsumoProducto extends Pivot
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'insumo_producto';

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
        'producto_id',
        'insumo_id',
        'cantidad_preparacion',
        'valor_unidad',
        'costo_preparacion',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cantidad_preparacion' => 'decimal:2',
            'valor_unidad' => 'decimal:2',
            'costo_preparacion' => 'decimal:2',
        ];
    }

    /**
     * Get the producto that owns the pivot.
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    /**
     * Get the insumo that owns the pivot.
     */
    public function insumo(): BelongsTo
    {
        return $this->belongsTo(Insumo::class);
    }

    /**
     * Calcular el valor por unidad.
     * valor_unidad = precio del insumo / presentación
     */
    public function calcularValorUnidad(): float
    {
        $insumo = $this->insumo;

        if (! $insumo) {
            return 0;
        }

        $presentacion = $insumo->presentacion ?? 0;

        if ($presentacion <= 0) {
            return 0;
        }

        return round($insumo->precio / $presentacion, 2);
    }

    /**
     * Calcular el costo de preparación.
     * costo_preparacion = valor_unidad * cantidad_preparacion
     */
    public function calcularCostoPreparacion(): float
    {
        return round($this->valor_unidad * $this->cantidad_preparacion, 2);
    }

    /**
     * Recalcular todos los valores derivados.
     */
    public function recalcular(): void
    {
        $this->valor_unidad = $this->calcularValorUnidad();
        $this->costo_preparacion = $this->calcularCostoPreparacion();
        $this->save();
    }
}
