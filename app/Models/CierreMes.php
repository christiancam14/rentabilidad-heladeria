<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CierreMes extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'cierres_mes';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'anio',
        'mes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'anio' => 'integer',
            'mes' => 'integer',
        ];
    }

    /**
     * Los productos vendidos en este cierre de mes.
     */
    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(Producto::class, 'cierre_mes_productos')
            ->using(CierreMesProducto::class)
            ->withPivot([
                'cantidad_vendida',
                'precio_venta_snapshot',
                'costo_unitario_snapshot',
            ])
            ->withTimestamps();
    }

    /**
     * Los registros de productos vendidos (pivot).
     */
    public function productosVendidos(): HasMany
    {
        return $this->hasMany(CierreMesProducto::class);
    }

    /**
     * Los gastos del cierre de mes (relación con tabla gastos_cierre_mes).
     * Nota: Se llama gastosItems() para evitar conflicto con la columna 'gastos' de la tabla.
     */
    public function gastosItems(): HasMany
    {
        return $this->hasMany(GastoCierreMes::class);
    }

    /**
     * Agregar o actualizar un producto vendido en el cierre.
     *
     * @param  Producto  $producto  El producto
     * @param  int  $cantidadVendida  Cantidad vendida
     */
    public function agregarProducto(Producto $producto, int $cantidadVendida): void
    {
        $this->productos()->syncWithoutDetaching([
            $producto->id => [
                'cantidad_vendida' => $cantidadVendida,
                'precio_venta_snapshot' => $producto->precio_venta_publico,
                'costo_unitario_snapshot' => $producto->costo_total,
            ],
        ]);
    }

    /**
     * Calcular ingresos totales del mes.
     */
    public function calcularIngresos(): float
    {
        return $this->productosVendidos()
            ->get()
            ->sum(function ($pivot) {
                return $pivot->cantidad_vendida * $pivot->precio_venta_snapshot;
            });
    }

    /**
     * Calcular costos totales de productos vendidos.
     */
    public function calcularCostos(): float
    {
        return $this->productosVendidos()
            ->get()
            ->sum(function ($pivot) {
                return $pivot->cantidad_vendida * $pivot->costo_unitario_snapshot;
            });
    }

    /**
     * Calcular ganancia bruta (ingresos - costos de productos).
     */
    public function calcularGananciaBruta(): float
    {
        return $this->calcularIngresos() - $this->calcularCostos();
    }

    /**
     * Calcular total de gastos del mes.
     */
    public function calcularTotalGastos(): float
    {
        return $this->gastosItems()->sum('valor');
    }

    /**
     * Calcular ganancia neta (ganancia bruta - gastos totales).
     */
    public function calcularGananciaNeta(): float
    {
        return $this->calcularGananciaBruta() - $this->calcularTotalGastos();
    }

    /**
     * Obtener el nombre del mes en español.
     */
    public function getNombreMesAttribute(): string
    {
        $meses = [
            1 => 'Enero',
            2 => 'Febrero',
            3 => 'Marzo',
            4 => 'Abril',
            5 => 'Mayo',
            6 => 'Junio',
            7 => 'Julio',
            8 => 'Agosto',
            9 => 'Septiembre',
            10 => 'Octubre',
            11 => 'Noviembre',
            12 => 'Diciembre',
        ];

        return $meses[$this->mes] ?? '';
    }

    /**
     * Obtener el período completo (ej: "Enero 2025").
     */
    public function getPeriodoAttribute(): string
    {
        return "{$this->nombre_mes} {$this->anio}";
    }
}
