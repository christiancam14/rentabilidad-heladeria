<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use App\Models\Cupon;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PromocionController extends Controller
{
    public function index(): Response
    {
        $config = Configuracion::todas();

        return Inertia::render('admin/promociones/index', [
            'cupones' => Cupon::orderByDesc('activo')->orderBy('codigo')->get(),
            'combos' => Producto::where('etiqueta', 'combo')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Producto $p) => [
                    'id' => $p->id,
                    'nombre' => $p->nombre,
                    'descripcion' => $p->descripcion,
                    'precio' => $p->precioBase(),
                    'precio_anterior' => $p->precio_anterior,
                    'visible_menu' => $p->visible_menu,
                    'imagen_url' => $p->imagen_url,
                    'color' => $p->color ?? 'turquesa',
                ]),
            'combo_destacado_id' => $config['combo_destacado_id'],
            'cupon_confirmacion' => [
                'activo' => (bool) $config['cupon_confirmacion_activo'],
                'codigo' => $config['cupon_confirmacion_codigo'],
            ],
        ]);
    }

    public function storeCupon(Request $request): RedirectResponse
    {
        Cupon::create($this->validarCupon($request));

        return back()->with('success', 'Cupón creado.');
    }

    public function updateCupon(Request $request, Cupon $cupon): RedirectResponse
    {
        $cupon->update($this->validarCupon($request, $cupon));

        return back()->with('success', 'Cupón actualizado.');
    }

    public function destroyCupon(Cupon $cupon): RedirectResponse
    {
        $cupon->delete();

        return back()->with('success', 'Cupón eliminado.');
    }

    public function destacar(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'combo_destacado_id' => ['nullable', 'integer', 'exists:productos,id'],
        ]);

        Configuracion::guardar($data);

        return back()->with('success', 'Combo destacado actualizado.');
    }

    /** @return array<string, mixed> */
    private function validarCupon(Request $request, ?Cupon $cupon = null): array
    {
        $request->merge(['codigo' => strtoupper(trim((string) $request->input('codigo', $cupon?->codigo)))]);

        return $request->validate([
            'codigo' => ['required', 'string', 'max:40', 'alpha_dash', Rule::unique('cupones', 'codigo')->ignore($cupon?->id)],
            'descripcion' => ['nullable', 'string', 'max:120'],
            'porcentaje' => [$cupon ? 'sometimes' : 'required', 'integer', 'min:1', 'max:100'],
            'activo' => ['sometimes', 'boolean'],
        ]);
    }
}
