<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Opcion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Biblioteca de sabores y adicionales. Marcar uno como no disponible
 * lo oculta de todos los productos a la vez (p. ej. se acabó un sabor).
 */
class OpcionController extends Controller
{
    public function index(): Response
    {
        $usos = DB::table('opcion_producto_grupo')
            ->selectRaw('opcion_id, COUNT(DISTINCT producto_grupos.producto_id) as productos')
            ->join('producto_grupos', 'producto_grupos.id', '=', 'opcion_producto_grupo.producto_grupo_id')
            ->groupBy('opcion_id')
            ->pluck('productos', 'opcion_id');

        $opciones = Opcion::orderBy('orden')->orderBy('nombre')->get()
            ->map(fn (Opcion $o) => [...$o->toArray(), 'productos' => (int) ($usos[$o->id] ?? 0)]);

        return Inertia::render('admin/opciones/index', [
            'sabores' => $opciones->where('tipo', 'sabor')->values(),
            'adicionales' => $opciones->where('tipo', 'adicional')->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'tipo' => ['required', Rule::in(Opcion::TIPOS)],
            'nombre' => ['required', 'string', 'max:60'],
            'precio' => ['nullable', 'integer', 'min:0', 'max:1000000'],
        ]);

        Opcion::create([
            ...$data,
            'precio' => $data['tipo'] === 'adicional' ? ($data['precio'] ?? 0) : 0,
            'orden' => (int) Opcion::where('tipo', $data['tipo'])->max('orden') + 1,
        ]);

        return back()->with('success', $data['tipo'] === 'sabor' ? 'Sabor agregado.' : 'Adicional agregado.');
    }

    public function update(Request $request, Opcion $opcion): RedirectResponse
    {
        $data = $request->validate([
            'nombre' => ['sometimes', 'string', 'max:60'],
            'precio' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'disponible' => ['sometimes', 'boolean'],
        ]);

        $opcion->update($data);

        return back();
    }

    public function destroy(Opcion $opcion): RedirectResponse
    {
        $opcion->delete();

        return back()->with('success', 'Opción eliminada de la biblioteca y de los productos.');
    }
}
