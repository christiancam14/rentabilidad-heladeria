<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use App\Models\Sede;
use App\Services\MenuCatalogo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Menú digital público: el cliente elige sede, arma su pedido y lo envía.
 */
class MenuController extends Controller
{
    public function index(Request $request, MenuCatalogo $catalogo): Response
    {
        $sedes = Sede::query()->where('en_menu', true)->orderBy('id')->get();

        $sede = $sedes->firstWhere('slug', $request->query('sede'))
            ?? $sedes->firstWhere('id', $request->session()->get('menu_sede_id'))
            ?? $sedes->first();

        abort_if(! $sede, 503, 'El menú aún no tiene sedes configuradas.');

        $request->session()->put('menu_sede_id', $sede->id);
        $config = Configuracion::todas();

        return Inertia::render('menu/index', [
            'negocio' => [
                'nombre' => $config['negocio_nombre'],
                'eslogan' => $config['negocio_eslogan'],
            ],
            'sedes' => $sedes->map(fn (Sede $s) => [
                'id' => $s->id,
                'nombre' => $s->nombre,
                'slug' => $s->slug,
                'direccion' => $s->direccion,
                'tiempo_preparacion' => $s->tiempo_preparacion,
                'recibiendo_pedidos' => $s->recibiendo_pedidos,
            ])->values(),
            'sede_id' => $sede->id,
            ...$catalogo->datosMenu($sede),
        ]);
    }
}
