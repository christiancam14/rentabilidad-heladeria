<?php

namespace App\Services;

use App\Models\Categoria;
use App\Models\Configuracion;
use App\Models\Opcion;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Producto;
use App\Models\ProductoGrupo;
use App\Models\Sede;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Arma el catálogo público del menú y cotiza los ítems de un pedido.
 * Los precios siempre se recalculan aquí: nunca se confía en el cliente.
 */
class MenuCatalogo
{
    /** @return Collection<int, Producto> */
    public function productosVisibles(?int $sedeId): Collection
    {
        return Producto::query()
            ->where('visible_menu', true)
            ->whereHas('categoria', fn ($q) => $q->where('visible', true))
            ->with([
                'tamanos' => fn ($q) => $q->where('activo', true),
                'grupos.opciones',
                'sedes',
            ])
            ->orderBy('orden')
            ->orderBy('nombre')
            ->get()
            ->filter(fn (Producto $p) => $p->disponibleEnSede($sedeId))
            ->values();
    }

    /** @return array<string, mixed> */
    public function serializarProducto(Producto $producto): array
    {
        return [
            'id' => $producto->id,
            'categoria_id' => $producto->categoria_id,
            'nombre' => $producto->nombre,
            'descripcion' => $producto->descripcion,
            'precio' => $producto->precioBase(),
            'precio_anterior' => $producto->precio_anterior,
            'imagen_url' => $producto->imagen_url,
            'color' => $producto->color ?? 'turquesa',
            'etiqueta' => $producto->etiqueta,
            'agotado' => $producto->agotado,
            'tamanos' => $producto->tamanos->map(fn ($t) => [
                'id' => $t->id,
                'nombre' => $t->nombre,
                'ajuste' => $t->ajuste_precio,
            ])->values(),
            'grupos' => $producto->grupos->map(fn (ProductoGrupo $g) => [
                'id' => $g->id,
                'nombre' => $g->nombre,
                'tipo' => $g->tipo,
                'obligatorio' => $g->obligatorio,
                'max' => $g->max_selecciones,
                'opciones' => $g->opciones
                    ->filter(fn (Opcion $o) => $o->pivot->activo && $o->disponible)
                    ->map(fn (Opcion $o) => [
                        'id' => $o->id,
                        'nombre' => $o->nombre,
                        'precio' => $g->tipo === 'adicional' ? $o->precio : 0,
                    ])->values(),
            ])->filter(fn ($g) => $g['opciones']->isNotEmpty())->values(),
        ];
    }

    /** @return array<string, mixed> */
    public function datosMenu(Sede $sede): array
    {
        $config = Configuracion::todas();
        $productos = $this->productosVisibles($sede->id);
        $ids = $productos->pluck('id');

        $categorias = Categoria::query()
            ->where('visible', true)
            ->orderBy('orden')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'slug', 'emoji'])
            ->filter(fn ($c) => $productos->contains('categoria_id', $c->id))
            ->values();

        // "Lo más pedido": ventas reales de los últimos 30 días; si aún no hay, las etiquetas
        $masVendidos = PedidoItem::query()
            ->whereIn('producto_id', $ids)
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('producto_id, SUM(cantidad) as unidades')
            ->groupBy('producto_id')
            ->orderByDesc('unidades')
            ->limit(8)
            ->pluck('producto_id');

        if ($masVendidos->count() < 3) {
            $masVendidos = $masVendidos
                ->merge($productos->where('etiqueta', 'mas_pedido')->pluck('id'))
                ->merge($productos->where('agotado', false)->pluck('id'))
                ->unique()
                ->take(8)
                ->values();
        }

        $combo = $productos->firstWhere('id', $config['combo_destacado_id'])
            ?? $productos->firstWhere('etiqueta', 'combo');

        // Sugerencias de venta cruzada: mayor margen primero, productos de ticket bajo
        $sugeridos = $productos
            ->where('agotado', false)
            ->filter(fn (Producto $p) => $p->precioBase() <= 12000)
            ->sortByDesc(fn (Producto $p) => (float) $p->porcentaje_rentabilidad)
            ->take(8)
            ->pluck('id')
            ->values();

        $pagos = collect(Pedido::metodosHabilitados($config))->map(fn ($label, $key) => [
            'key' => $key,
            'label' => $label,
        ])->values();

        return [
            'categorias' => $categorias,
            'productos' => $productos->map(fn ($p) => $this->serializarProducto($p))->values(),
            'mas_pedidos' => $masVendidos,
            'combo_id' => $combo?->id,
            'sugeridos' => $sugeridos,
            'reglas' => [
                'pedido_minimo' => (int) $config['pedido_minimo'],
                'meta_regalo' => $config['meta_regalo_activa'] ? [
                    'desde' => (int) $config['meta_regalo_desde'],
                    'texto' => $config['meta_regalo_texto'],
                ] : null,
                'sugerencias_producto' => (bool) $config['sugerencias_producto'],
                'sugerencias_carrito' => (bool) $config['sugerencias_carrito'],
                'pagos' => $pagos,
            ],
        ];
    }

    /**
     * Cotiza una línea del carrito validando tamaño y opciones contra el catálogo.
     *
     * @param  array{producto_id:int, cantidad:int, tamano_id?:int|null, opciones?:array<int>}  $linea
     * @return array{producto: Producto, nombre: string, detalle: ?string, cantidad: int, precio_unitario: int, total: int}
     */
    public function cotizarLinea(array $linea, int $sedeId, string $campo): array
    {
        /** @var Producto|null $producto */
        $producto = Producto::with(['tamanos', 'grupos.opciones', 'sedes'])->find($linea['producto_id']);

        if (! $producto || ! $producto->visible_menu || $producto->agotado || ! $producto->disponibleEnSede($sedeId)) {
            throw ValidationException::withMessages([$campo => 'Uno de los productos ya no está disponible.']);
        }

        $precio = $producto->precioBase();
        $detalle = [];

        $tamanosActivos = $producto->tamanos->where('activo', true);
        if ($tamanosActivos->isNotEmpty()) {
            $tamano = $tamanosActivos->firstWhere('id', $linea['tamano_id'] ?? null);
            if (! $tamano) {
                throw ValidationException::withMessages([$campo => "Elige un tamaño para {$producto->nombre}."]);
            }
            $precio += $tamano->ajuste_precio;
            $detalle[] = $tamano->nombre;
        }

        $elegidas = collect($linea['opciones'] ?? [])->map(fn ($id) => (int) $id)->unique();
        $usadas = collect();

        foreach ($producto->grupos as $grupo) {
            $validas = $grupo->opciones->filter(fn ($o) => $o->pivot->activo && $o->disponible);
            $enGrupo = $validas->whereIn('id', $elegidas);

            if ($grupo->obligatorio && $validas->isNotEmpty() && $enGrupo->isEmpty()) {
                throw ValidationException::withMessages([$campo => "Completa \"{$grupo->nombre}\" en {$producto->nombre}."]);
            }
            if ($enGrupo->count() > $grupo->max_selecciones) {
                throw ValidationException::withMessages([$campo => "Máximo {$grupo->max_selecciones} en \"{$grupo->nombre}\"."]);
            }

            if ($enGrupo->isNotEmpty()) {
                if ($grupo->tipo === 'adicional') {
                    $precio += $enGrupo->sum('precio');
                    $detalle[] = $enGrupo->map(fn ($o) => '+ '.$o->nombre)->implode(', ');
                } else {
                    $detalle[] = $enGrupo->pluck('nombre')->implode(', ');
                }
            }

            $usadas = $usadas->merge($enGrupo->pluck('id'));
        }

        if ($elegidas->diff($usadas)->isNotEmpty()) {
            throw ValidationException::withMessages([$campo => "Algunas opciones de {$producto->nombre} ya no están disponibles."]);
        }

        $cantidad = (int) $linea['cantidad'];
        $precio = max(0, $precio);

        return [
            'producto' => $producto,
            'nombre' => $producto->nombre,
            'detalle' => $detalle ? implode(' · ', $detalle) : null,
            'cantidad' => $cantidad,
            'precio_unitario' => $precio,
            'total' => $precio * $cantidad,
        ];
    }
}
