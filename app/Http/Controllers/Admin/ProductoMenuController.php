<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Opcion;
use App\Models\Producto;
use App\Models\Sede;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Productos del menú digital. Es el mismo modelo Producto que usa el costeo
 * de rentabilidad: aquí se edita lo que ve el cliente; en /productos la receta.
 */
class ProductoMenuController extends Controller
{
    public function index(Request $request): Response
    {
        $productos = Producto::query()
            ->with('categoria:id,nombre,orden')
            ->withCount([
                'tamanos' => fn ($q) => $q->where('activo', true),
                'insumos',
            ])
            ->with('grupos:id,producto_id,tipo')
            ->get()
            ->sortBy([
                fn ($a, $b) => ($a->categoria?->orden ?? PHP_INT_MAX) <=> ($b->categoria?->orden ?? PHP_INT_MAX),
                ['orden', 'asc'],
                ['nombre', 'asc'],
            ])
            ->values()
            ->map(fn (Producto $p) => [
                'id' => $p->id,
                'nombre' => $p->nombre,
                'categoria_id' => $p->categoria_id,
                'categoria' => $p->categoria?->nombre,
                'precio' => $p->precioBase(),
                'imagen_url' => $p->imagen_url,
                'color' => $p->color ?? 'turquesa',
                'etiqueta' => $p->etiqueta,
                'agotado' => $p->agotado,
                'visible_menu' => $p->visible_menu,
                'tamanos' => $p->tamanos_count,
                'grupos_sabor' => $p->grupos->where('tipo', 'sabor')->count(),
                'grupos_adicional' => $p->grupos->where('tipo', 'adicional')->count(),
                'tiene_receta' => $p->insumos_count > 0,
                'porcentaje_rentabilidad' => (float) $p->porcentaje_rentabilidad,
                'actualizado' => $p->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/productos/index', [
            'productos' => $productos,
            'categorias' => Categoria::orderBy('orden')->orderBy('nombre')->get(['id', 'nombre', 'emoji']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/productos/form', [
            ...$this->catalogos(),
            'producto' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $producto = DB::transaction(function () use ($request) {
            $producto = new Producto([
                'costo_total' => 0,
                'ganancia' => 0,
                'porcentaje_rentabilidad' => 0,
            ]);

            return $this->guardar($request, $producto);
        });

        return redirect()->route('admin.productos.edit', $producto)->with('success', 'Producto creado.');
    }

    public function edit(Producto $producto): Response
    {
        $producto->load(['tamanos', 'grupos.opciones', 'sedes']);

        return Inertia::render('admin/productos/form', [
            ...$this->catalogos(),
            'producto' => [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'descripcion' => $producto->descripcion,
                'categoria_id' => $producto->categoria_id,
                'precio' => $producto->precioBase(),
                'precio_anterior' => $producto->precio_anterior,
                'imagen_url' => $producto->imagen_url,
                'color' => $producto->color ?? 'turquesa',
                'etiqueta' => $producto->etiqueta,
                'visible_menu' => $producto->visible_menu,
                'agotado' => $producto->agotado,
                'sedes_ocultas' => $producto->sedes->where('pivot.disponible', false)->pluck('id')->values(),
                'tamanos' => $producto->tamanos->map(fn ($t) => [
                    'nombre' => $t->nombre,
                    'ajuste_precio' => $t->ajuste_precio,
                    'activo' => $t->activo,
                ]),
                'grupos' => $producto->grupos->map(fn ($g) => [
                    'nombre' => $g->nombre,
                    'tipo' => $g->tipo,
                    'obligatorio' => $g->obligatorio,
                    'max_selecciones' => $g->max_selecciones,
                    'opciones' => $g->opciones->map(fn ($o) => [
                        'id' => $o->id,
                        'activo' => (bool) $o->pivot->activo,
                    ]),
                ]),
                'rentabilidad' => [
                    'costo_total' => (float) $producto->costo_total,
                    'ganancia' => (float) $producto->ganancia,
                    'porcentaje' => (float) $producto->porcentaje_rentabilidad,
                    'insumos' => $producto->insumos()->count(),
                ],
            ],
        ]);
    }

    public function update(Request $request, Producto $producto): RedirectResponse
    {
        DB::transaction(fn () => $this->guardar($request, $producto));

        return back()->with('success', 'Cambios guardados.');
    }

    /** Mostrar u ocultar en el menú al instante (toggle de la tabla). */
    public function visibilidad(Request $request, Producto $producto): RedirectResponse
    {
        $data = $request->validate([
            'visible_menu' => ['sometimes', 'boolean'],
            'agotado' => ['sometimes', 'boolean'],
        ]);

        $producto->update($data);

        return back();
    }

    /** Reordenar productos (arrastrar ⋮⋮ en la tabla). */
    public function ordenar(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data['ids'] as $orden => $id) {
                Producto::whereKey($id)->update(['orden' => $orden]);
            }
        });

        return back();
    }

    public function destroy(Producto $producto): RedirectResponse
    {
        if ($producto->imagen && ! str_starts_with($producto->imagen, '/')) {
            Storage::disk('public')->delete($producto->imagen);
        }

        $producto->delete();

        return redirect()->route('admin.productos.index')->with('success', 'Producto eliminado.');
    }

    /** @return array<string, mixed> */
    private function catalogos(): array
    {
        return [
            'categorias' => Categoria::orderBy('orden')->orderBy('nombre')->get(['id', 'nombre', 'emoji']),
            'opciones' => Opcion::orderBy('tipo')->orderBy('orden')->orderBy('nombre')->get(['id', 'tipo', 'nombre', 'precio', 'disponible']),
            'sedes' => Sede::orderBy('id')->get(['id', 'nombre']),
            'etiquetas' => collect(Producto::ETIQUETAS)->map(fn ($label, $key) => ['value' => $key, 'label' => $label])->values(),
        ];
    }

    private function guardar(Request $request, Producto $producto): Producto
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:60'],
            'descripcion' => ['nullable', 'string', 'max:200'],
            'categoria_id' => ['nullable', 'integer', 'exists:categorias,id'],
            'precio' => ['required', 'integer', 'min:0', 'max:10000000'],
            'precio_anterior' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'color' => ['nullable', Rule::in(Producto::COLORES)],
            'etiqueta' => ['nullable', Rule::in(array_keys(Producto::ETIQUETAS))],
            'visible_menu' => ['boolean'],
            'agotado' => ['boolean'],
            'imagen' => ['nullable', 'image', 'max:4096'],
            'quitar_imagen' => ['boolean'],
            'sedes_ocultas' => ['array'],
            'sedes_ocultas.*' => ['integer', 'exists:sedes,id'],
            'tamanos' => ['array', 'max:10'],
            'tamanos.*.nombre' => ['required', 'string', 'max:60'],
            'tamanos.*.ajuste_precio' => ['required', 'integer', 'min:-1000000', 'max:1000000'],
            'tamanos.*.activo' => ['boolean'],
            'grupos' => ['array', 'max:10'],
            'grupos.*.nombre' => ['required', 'string', 'max:60'],
            'grupos.*.tipo' => ['required', Rule::in(Opcion::TIPOS)],
            'grupos.*.obligatorio' => ['boolean'],
            'grupos.*.max_selecciones' => ['required', 'integer', 'min:1', 'max:20'],
            'grupos.*.opciones' => ['array'],
            'grupos.*.opciones.*.id' => ['required', 'integer', 'exists:opciones,id'],
            'grupos.*.opciones.*.activo' => ['boolean'],
        ], [
            'nombre.required' => 'El producto necesita un nombre.',
            'tamanos.*.nombre.required' => 'Cada tamaño necesita un nombre.',
            'grupos.*.nombre.required' => 'Cada grupo necesita un nombre.',
        ]);

        $precioCambio = $producto->exists && $producto->precioBase() !== (int) $data['precio'];

        $producto->fill([
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? null,
            'categoria_id' => $data['categoria_id'] ?? null,
            'precio_venta_publico' => $data['precio'],
            'precio_anterior' => $data['precio_anterior'] ?? null,
            'color' => $data['color'] ?? 'turquesa',
            'etiqueta' => $data['etiqueta'] ?? null,
            'visible_menu' => $data['visible_menu'] ?? false,
            'agotado' => $data['agotado'] ?? false,
        ]);

        if ($request->boolean('quitar_imagen') || $request->hasFile('imagen')) {
            if ($producto->imagen && ! str_starts_with($producto->imagen, '/')) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $producto->imagen = $request->hasFile('imagen')
                ? $request->file('imagen')->store('productos', 'public')
                : null;
        }

        $producto->save();

        // El precio de venta alimenta el cálculo de rentabilidad
        if ($precioCambio || $producto->wasRecentlyCreated) {
            $producto->recalcularTotales();
        }

        $producto->tamanos()->delete();
        foreach (array_values($data['tamanos'] ?? []) as $i => $tamano) {
            $producto->tamanos()->create([
                'nombre' => $tamano['nombre'],
                'ajuste_precio' => $tamano['ajuste_precio'],
                'activo' => $tamano['activo'] ?? true,
                'orden' => $i,
            ]);
        }

        $producto->grupos()->delete();
        foreach (array_values($data['grupos'] ?? []) as $i => $grupo) {
            $nuevo = $producto->grupos()->create([
                'nombre' => $grupo['nombre'],
                'tipo' => $grupo['tipo'],
                'obligatorio' => $grupo['obligatorio'] ?? false,
                'max_selecciones' => $grupo['max_selecciones'],
                'orden' => $i,
            ]);
            $nuevo->opciones()->sync(
                collect($grupo['opciones'] ?? [])->mapWithKeys(fn ($o) => [$o['id'] => ['activo' => $o['activo'] ?? true]])->all()
            );
        }

        $sedesOcultas = collect($data['sedes_ocultas'] ?? []);
        $producto->sedes()->sync(
            Sede::pluck('id')->mapWithKeys(fn ($id) => [$id => ['disponible' => ! $sedesOcultas->contains($id)]])->all()
        );

        return $producto;
    }
}
