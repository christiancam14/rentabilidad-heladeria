<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Producto extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'precio_venta_publico',
        'costo_total',
        'ganancia',
        'porcentaje_rentabilidad',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'precio_venta_publico' => 'decimal:2',
            'costo_total' => 'decimal:2',
            'ganancia' => 'decimal:2',
            'porcentaje_rentabilidad' => 'decimal:2',
        ];
    }

    /**
     * Los insumos que componen este producto.
     */
    public function insumos(): BelongsToMany
    {
        return $this->belongsToMany(Insumo::class, 'insumo_producto')
            ->using(InsumoProducto::class)
            ->withPivot([
                'cantidad_preparacion',
                'valor_unidad',
                'costo_preparacion',
            ])
            ->withTimestamps();
    }

    /**
     * Los cierres de mes en los que aparece este producto.
     */
    public function cierresMes(): BelongsToMany
    {
        return $this->belongsToMany(CierreMes::class, 'cierre_mes_productos')
            ->using(CierreMesProducto::class)
            ->withPivot([
                'cantidad_vendida',
                'precio_venta_snapshot',
                'costo_unitario_snapshot',
            ])
            ->withTimestamps();
    }

    /**
     * Agregar un insumo al producto con cálculos automáticos.
     *
     * @param  Insumo  $insumo  El insumo a agregar
     * @param  float  $cantidadPreparacion  Cantidad usada en la preparación
     */
    /** Evita recalcular en cada insumo (p. ej. durante seed masivo). */
    public static bool $omitirRecalculoEnAgregar = false;

    public function agregarInsumo(Insumo $insumo, float $cantidadPreparacion): void
    {
        // Usar la presentación del insumo
        $presentacion = $insumo->presentacion ?? 0;

        // Calcular valor_unidad = precio del insumo / presentación
        $valorUnidad = $presentacion > 0 ? $insumo->precio / $presentacion : 0;

        // Calcular costo_preparacion = valor_unidad * cantidad_preparacion
        $costoPreparacion = $valorUnidad * $cantidadPreparacion;

        // Agregar o actualizar el insumo en la tabla pivot
        $this->insumos()->syncWithoutDetaching([
            $insumo->id => [
                'cantidad_preparacion' => $cantidadPreparacion,
                'valor_unidad' => round($valorUnidad, 2),
                'costo_preparacion' => round($costoPreparacion, 2),
            ],
        ]);

        if (! static::$omitirRecalculoEnAgregar) {
            $this->recalcularTotales();
        }
    }

    /**
     * Sincroniza todos los insumos de una receta en una sola operación (ideal para seeders).
     *
     * @param  array<int, array{0: Insumo, 1: float}>  $lineas  Pares [insumo, cantidad_preparacion]
     */
    public function sincronizarInsumosReceta(array $lineas): void
    {
        $sync = [];

        foreach ($lineas as [$insumo, $cantidadPreparacion]) {
            $presentacion = $insumo->presentacion ?? 0;
            $valorUnidad = $presentacion > 0 ? $insumo->precio / $presentacion : 0;
            $costoPreparacion = $valorUnidad * $cantidadPreparacion;

            $sync[$insumo->id] = [
                'cantidad_preparacion' => $cantidadPreparacion,
                'valor_unidad' => round($valorUnidad, 2),
                'costo_preparacion' => round($costoPreparacion, 2),
            ];
        }

        $this->insumos()->sync($sync);
        $this->recalcularTotales();
    }

    /**
     * Actualizar un insumo existente del producto.
     *
     * @param  Insumo  $insumo  El insumo a actualizar
     * @param  float  $cantidadPreparacion  Cantidad usada en la preparación
     */
    public function actualizarInsumo(Insumo $insumo, float $cantidadPreparacion): void
    {
        $this->agregarInsumo($insumo, $cantidadPreparacion);
    }

    /**
     * Eliminar un insumo del producto.
     */
    public function eliminarInsumo(Insumo $insumo): void
    {
        $this->insumos()->detach($insumo->id);
        $this->recalcularTotales();
    }

    /**
     * Recalcular los totales del producto basándose en los insumos.
     */
    public function recalcularTotales(): void
    {
        // Recargar la relación para obtener datos actualizados
        $this->load('insumos');

        // Sumar todos los costos de preparación
        $costoTotal = $this->insumos->sum('pivot.costo_preparacion');

        // Calcular ganancia
        $ganancia = $this->precio_venta_publico - $costoTotal;

        // Calcular porcentaje de rentabilidad
        $porcentajeRentabilidad = $this->precio_venta_publico > 0
            ? ($ganancia / $this->precio_venta_publico) * 100
            : 0;

        // Actualizar el producto
        $this->update([
            'costo_total' => round($costoTotal, 2),
            'ganancia' => round($ganancia, 2),
            'porcentaje_rentabilidad' => round($porcentajeRentabilidad, 2),
        ]);
    }

    /**
     * Recalcular los costos de preparación cuando se actualiza un insumo.
     * Útil cuando cambia el precio de un insumo.
     */
    public function recalcularCostosInsumos(): void
    {
        foreach ($this->insumos as $insumo) {
            // Usar la presentación del insumo
            $presentacion = $insumo->presentacion ?? 0;
            $cantidadPreparacion = $insumo->pivot->cantidad_preparacion;

            // Recalcular con el precio actualizado del insumo
            $valorUnidad = $presentacion > 0 ? $insumo->precio / $presentacion : 0;
            $costoPreparacion = $valorUnidad * $cantidadPreparacion;

            // Actualizar la tabla pivot
            $this->insumos()->updateExistingPivot($insumo->id, [
                'valor_unidad' => round($valorUnidad, 2),
                'costo_preparacion' => round($costoPreparacion, 2),
            ]);
        }

        $this->recalcularTotales();
    }

    /**
     * Obtener el detalle de costos del producto.
     */
    public function getDetalleCostos(): array
    {
        $this->load('insumos');

        return [
            'producto' => $this->nombre,
            'precio_venta_publico' => $this->precio_venta_publico,
            'insumos' => $this->insumos->map(function ($insumo) {
                return [
                    'nombre' => $insumo->nombre,
                    'precio_insumo' => $insumo->precio,
                    'unidad' => $insumo->unidad,
                    'presentacion' => $insumo->presentacion,
                    'valor_unidad' => $insumo->pivot->valor_unidad,
                    'cantidad_preparacion' => $insumo->pivot->cantidad_preparacion,
                    'costo_preparacion' => $insumo->pivot->costo_preparacion,
                ];
            })->toArray(),
            'costo_total' => $this->costo_total,
            'ganancia' => $this->ganancia,
            'porcentaje_rentabilidad' => $this->porcentaje_rentabilidad,
        ];
    }
}
