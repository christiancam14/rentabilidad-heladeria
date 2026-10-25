<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Configuracion;
use App\Models\Cupon;
use App\Models\Opcion;
use App\Models\Producto;
use App\Models\Sede;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Importa el catálogo de la landing "a-tu-gusto" al menú digital.
 * Es idempotente: si un producto ya existe (mismo nombre) solo completa
 * los campos del menú que estén vacíos y respeta su precio y su receta.
 */
class MenuSeeder extends Seeder
{
    /** Categoría de la landing => [nombre en el menú, emoji, color de foto, orden] */
    private const CATEGORIAS = [
        'Copas' => ['Copas', '🍨', 'turquesa', 0],
        'Malteadas' => ['Milkshakes', '🥤', 'rosa', 1],
        'Crepes' => ['Crepes y waffles', '🧇', 'amarillo', 2],
        'Waffles' => ['Crepes y waffles', '🧇', 'rosa', 2],
        'Infantil' => ['Infantil', '🧸', 'amarillo', 3],
        'Obleas' => ['Obleas', '🫓', 'amarillo', 4],
        'Cholaos' => ['De la casa', '🍰', 'turquesa', 5],
        'Ensaladas' => ['Ensaladas', '🍓', 'rosa', 6],
        'Frappés' => ['Bebidas', '🧋', 'turquesa', 7],
    ];

    /** Prefijos para que los nombres cortos de la landing sean claros en el menú. */
    private const PREFIJOS = [
        'Malteadas' => 'Milkshake ',
        'Frappés' => 'Frappé de ',
    ];

    private const ADICIONALES = [
        ['Nutella', 2500],
        ['Toppings de colores', 1500],
        ['Brownie extra', 3000],
        ['Chantilly extra', 1500],
        ['Fresas extra', 2500],
    ];

    private const ETIQUETAS = [
        'Waffle éxtasis de chocolate' => 'mas_pedido',
        'Fresas con crema' => 'mas_pedido',
        'Maracumango' => 'nuevo',
        'Ensalada especial' => 'para_compartir',
    ];

    public function run(): void
    {
        $data = json_decode(file_get_contents(__DIR__.'/data/menu-landing.json'), true);
        $imagenes = $this->imagenesDisponibles();

        $sabores = collect($data['sabores'])->values()->map(fn ($nombre, $i) => Opcion::firstOrCreate(
            ['tipo' => 'sabor', 'nombre' => $nombre],
            ['orden' => $i],
        ));

        $adicionales = collect(self::ADICIONALES)->map(fn ($a, $i) => Opcion::firstOrCreate(
            ['tipo' => 'adicional', 'nombre' => $a[0]],
            ['precio' => $a[1], 'orden' => $i],
        ));

        $existentes = Producto::all()->keyBy(fn (Producto $p) => $this->normalizar($p->nombre));

        foreach ($data['productos'] as $origen => $productos) {
            [$nombreCategoria, $emoji, $color, $orden] = self::CATEGORIAS[$origen] ?? [$origen, null, 'turquesa', 99];

            $categoria = Categoria::firstOrCreate(
                ['slug' => Str::slug($nombreCategoria)],
                ['nombre' => $nombreCategoria, 'emoji' => $emoji, 'orden' => $orden],
            );

            foreach ($productos as $i => $item) {
                $nombre = (self::PREFIJOS[$origen] ?? '').$item['name'];
                $producto = $existentes->get($this->normalizar($nombre))
                    ?? $existentes->get($this->normalizar($item['name']));

                if (! $producto) {
                    $producto = Producto::create([
                        'nombre' => $nombre,
                        'precio_venta_publico' => $item['price'],
                        'costo_total' => 0,
                        'ganancia' => $item['price'],
                        'porcentaje_rentabilidad' => 100,
                    ]);
                    $existentes->put($this->normalizar($nombre), $producto);
                }

                $producto->fill(array_filter([
                    'categoria_id' => $producto->categoria_id ?? $categoria->id,
                    'descripcion' => $producto->descripcion ?? $item['description'],
                    'imagen' => $producto->imagen ?? $imagenes[strtolower($item['image'])] ?? null,
                    'color' => $producto->color ?? $color,
                    'etiqueta' => $producto->etiqueta ?? (self::ETIQUETAS[$item['name']] ?? null),
                ], fn ($v) => $v !== null));

                if (! $producto->exists || $producto->wasRecentlyCreated || ! $producto->getOriginal('categoria_id')) {
                    $producto->visible_menu = true;
                    $producto->orden = $i;
                }

                $producto->save();
                $this->configurarOpciones($producto, $origen, $item, $sabores, $adicionales);
            }
        }

        $this->crearCombo($adicionales);
        $this->configurarSedes();

        Cupon::firstOrCreate(['codigo' => 'VUELVE10'], ['porcentaje' => 10, 'descripcion' => 'Para tu próxima visita']);
    }

    private function configurarOpciones(Producto $producto, string $origen, array $item, $sabores, $adicionales): void
    {
        if ($producto->tamanos()->exists() || $producto->grupos()->exists()) {
            return;
        }

        foreach ($item['variations'] ?? [] as $i => $variacion) {
            $producto->tamanos()->create(['nombre' => $variacion, 'ajuste_precio' => 0, 'orden' => $i]);
        }

        $maxSabores = match ($origen) {
            'Copas', 'Ensaladas', 'Waffles', 'Crepes' => 2,
            'Infantil', 'Malteadas', 'Cholaos' => 1,
            default => 0,
        };

        if ($maxSabores > 0) {
            $grupo = $producto->grupos()->create([
                'nombre' => $maxSabores > 1 ? "Elige {$maxSabores} sabores" : 'Elige tu sabor',
                'tipo' => 'sabor',
                'obligatorio' => true,
                'max_selecciones' => $maxSabores,
                'orden' => 0,
            ]);
            $grupo->opciones()->sync($sabores->pluck('id'));
        }

        if (in_array($origen, ['Copas', 'Malteadas', 'Waffles', 'Crepes', 'Obleas', 'Ensaladas'], true)) {
            $grupo = $producto->grupos()->create([
                'nombre' => 'Súmale algo rico',
                'tipo' => 'adicional',
                'obligatorio' => false,
                'max_selecciones' => 3,
                'orden' => 1,
            ]);
            $grupo->opciones()->sync($adicionales->take(3)->pluck('id'));
        }
    }

    private function crearCombo($adicionales): void
    {
        $copas = Categoria::where('slug', 'copas')->first();

        $combo = Producto::firstOrCreate(
            ['nombre' => 'Combo Antojo'],
            [
                'categoria_id' => $copas?->id,
                'descripcion' => 'Copa + malteada pequeña',
                'precio_venta_publico' => 22000,
                'precio_anterior' => 25000,
                'costo_total' => 0,
                'ganancia' => 22000,
                'porcentaje_rentabilidad' => 100,
                'color' => 'turquesa',
                'etiqueta' => 'combo',
                'visible_menu' => true,
                'orden' => 99,
            ],
        );

        if (! Configuracion::obtener('combo_destacado_id')) {
            Configuracion::guardar(['combo_destacado_id' => $combo->id]);
        }
    }

    private function configurarSedes(): void
    {
        Sede::whereNull('horarios')->get()->each(fn (Sede $sede) => $sede->update(['horarios' => Sede::HORARIOS_DEFAULT]));
    }

    /** @return array<string, string> nombre en minúsculas => ruta pública */
    private function imagenesDisponibles(): array
    {
        $archivos = glob(public_path('img/productos/*.webp')) ?: [];

        return collect($archivos)->mapWithKeys(fn ($ruta) => [
            strtolower(basename($ruta)) => '/img/productos/'.basename($ruta),
        ])->all();
    }

    private function normalizar(string $nombre): string
    {
        return Str::of($nombre)->ascii()->lower()->squish()->value();
    }
}
