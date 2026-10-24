<?php

namespace App\Http\Middleware;

use App\Models\Pedido;
use App\Models\Sede;
use App\Support\SedeActiva;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'admin' => fn () => $request->user() ? $this->datosAdmin($request) : null,
        ];
    }

    /**
     * Datos del shell administrativo: sede activa y pedidos por atender.
     *
     * @return array<string, mixed>
     */
    private function datosAdmin(Request $request): array
    {
        $sede = SedeActiva::obtener($request);

        return [
            'sedes' => Sede::orderBy('id')->get(['id', 'nombre']),
            'sede_activa' => $sede ? [
                'id' => $sede->id,
                'nombre' => $sede->nombre,
                'recibiendo_pedidos' => (bool) $sede->recibiendo_pedidos,
            ] : null,
            'pedidos_nuevos' => $sede ? Pedido::where('sede_id', $sede->id)->where('estado', 'nuevo')->count() : 0,
        ];
    }
}
