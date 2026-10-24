<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoriaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/categorias/index', [
            'categorias' => Categoria::query()
                ->withCount(['productos', 'productos as visibles_count' => fn ($q) => $q->where('visible_menu', true)])
                ->orderBy('orden')
                ->orderBy('nombre')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validar($request);
        $data['slug'] = $this->slugUnico($data['nombre']);
        $data['orden'] = (int) Categoria::max('orden') + 1;

        Categoria::create($data);

        return back()->with('success', 'Categoría creada.');
    }

    public function update(Request $request, Categoria $categoria): RedirectResponse
    {
        $data = $this->validar($request, $categoria);

        if (isset($data['nombre']) && $data['nombre'] !== $categoria->nombre) {
            $data['slug'] = $this->slugUnico($data['nombre'], $categoria->id);
        }

        $categoria->update($data);

        return back()->with('success', 'Categoría actualizada.');
    }

    public function ordenar(Request $request): RedirectResponse
    {
        $data = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']]);

        foreach ($data['ids'] as $orden => $id) {
            Categoria::whereKey($id)->update(['orden' => $orden]);
        }

        return back();
    }

    public function destroy(Categoria $categoria): RedirectResponse
    {
        $categoria->delete();

        return back()->with('success', 'Categoría eliminada. Sus productos quedaron sin categoría.');
    }

    /** @return array<string, mixed> */
    private function validar(Request $request, ?Categoria $categoria = null): array
    {
        return $request->validate([
            'nombre' => [$categoria ? 'sometimes' : 'required', 'string', 'max:40'],
            'emoji' => ['nullable', 'string', 'max:16'],
            'visible' => ['sometimes', 'boolean'],
        ]);
    }

    private function slugUnico(string $nombre, ?int $ignorar = null): string
    {
        $base = Str::slug($nombre) ?: 'categoria';
        $slug = $base;
        $i = 2;

        while (Categoria::where('slug', $slug)->when($ignorar, fn ($q) => $q->whereKeyNot($ignorar))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
