<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Ajustes clave-valor del negocio y del menú de pedido.
 */
class Configuracion extends Model
{
    protected $table = 'configuraciones';

    protected $primaryKey = 'clave';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['clave', 'valor'];

    protected function casts(): array
    {
        return [
            'valor' => 'json',
        ];
    }

    public const DEFAULTS = [
        'negocio_nombre' => 'Heladería A Tu Gusto',
        'negocio_eslogan' => '¿Qué se te antoja hoy?',
        'negocio_instagram' => 'https://www.instagram.com/heladeriaatugusto/',
        'negocio_facebook' => 'https://www.facebook.com/HeladeriaATuGustoBucaramanga',
        'negocio_tiktok' => 'https://www.tiktok.com/@heladeriaatugusto',
        'pedido_minimo' => 10000,
        'meta_regalo_activa' => true,
        'meta_regalo_desde' => 40000,
        'meta_regalo_texto' => 'Topping gratis',
        'sugerencias_producto' => true,
        'sugerencias_carrito' => true,
        'cupon_confirmacion_activo' => true,
        'cupon_confirmacion_codigo' => 'VUELVE10',
        'pago_caja' => true,
        'pago_transferencia' => true,
        'pago_nequi' => false,
        'combo_destacado_id' => null,
    ];

    /** @return array<string, mixed> */
    public static function todas(): array
    {
        $guardadas = static::query()->pluck('valor', 'clave')->all();

        return array_merge(self::DEFAULTS, array_intersect_key($guardadas, self::DEFAULTS));
    }

    public static function obtener(string $clave): mixed
    {
        return static::todas()[$clave] ?? null;
    }

    /** @param  array<string, mixed>  $valores */
    public static function guardar(array $valores): void
    {
        foreach (array_intersect_key($valores, self::DEFAULTS) as $clave => $valor) {
            static::updateOrCreate(['clave' => $clave], ['valor' => $valor]);
        }
    }
}
