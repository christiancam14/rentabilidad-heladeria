<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Insumo extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'precio',
        'unidad',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
        ];
    }

    /**
     * Los productos que usan este insumo.
     */
    public function productos(): BelongsToMany
    {
        return $this->belongsToMany(Producto::class, 'insumo_producto')
            ->using(InsumoProducto::class)
            ->withPivot([
                'presentacion',
                'cantidad_preparacion',
                'valor_unidad',
                'costo_preparacion',
            ])
            ->withTimestamps();
    }

    /**
     * Unidades disponibles para los insumos.
     */
    public static function unidadesDisponibles(): array
    {
        return [
            'LIBRA',
            'KILO',
            'UNIDAD',
            'GRAMO',
            'LITRO',
            'MILILITRO',
        ];
    }
}
