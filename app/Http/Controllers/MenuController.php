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
            'negocio' => $this->negocio($config),
            'sedes' => $sedes->map(fn (Sede $s) => $this->sede($s))->values(),
            'sede_id' => $sede->id,
            ...$catalogo->datosMenu($sede),
        ]);
    }

    /** Página de enlaces tipo Linktree para la bio de Instagram y TikTok. */
    public function links(): Response
    {
        $config = Configuracion::todas();

        return Inertia::render('links', [
            'negocio' => $this->negocio($config),
            'sedes' => Sede::query()->where('en_menu', true)->orderBy('id')->get()
                ->map(fn (Sede $s) => $this->sede($s))->values(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $config
     * @return array<string, mixed>
     */
    private function negocio(array $config): array
    {
        return [
            'nombre' => $config['negocio_nombre'],
            'eslogan' => $config['negocio_eslogan'],
            'redes' => array_filter([
                'instagram' => $config['negocio_instagram'] ?: null,
                'facebook' => $config['negocio_facebook'] ?: null,
                'tiktok' => $config['negocio_tiktok'] ?: null,
            ]),
        ];
    }

    /** @return array<string, mixed> */
    private function sede(Sede $s): array
    {
        return [
            'id' => $s->id,
            'nombre' => $s->nombre,
            'slug' => $s->slug,
            'direccion' => $s->direccion,
            'tiempo_preparacion' => $s->tiempo_preparacion,
            'recibiendo_pedidos' => $s->recibiendo_pedidos,
            'maps_url' => $s->maps_url,
            'whatsapp_url' => $s->whatsappUrl('¡Hola! Buen día. ¿Tienen servicio? 😁'),
            'horarios' => collect($s->horarios ?: Sede::HORARIOS_DEFAULT)->where('activo', true)->values(),
        ];
    }
}
