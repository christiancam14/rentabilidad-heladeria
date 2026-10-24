<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use App\Models\Cupon;
use App\Models\Sede;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/configuracion/index', [
            'config' => Configuracion::todas(),
            'sedes' => Sede::orderBy('id')->get()->map(fn (Sede $s) => [
                'id' => $s->id,
                'nombre' => $s->nombre,
                'direccion' => $s->direccion ?? '',
                'whatsapp' => $s->whatsapp ?? '',
                'tiempo_preparacion' => $s->tiempo_preparacion,
                'recibiendo_pedidos' => $s->recibiendo_pedidos,
                'en_menu' => $s->en_menu,
                'horarios' => $s->horarios ?: Sede::HORARIOS_DEFAULT,
            ]),
            'cupones' => Cupon::where('activo', true)->orderBy('codigo')->get(['codigo', 'porcentaje']),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'config' => ['required', 'array'],
            'config.negocio_nombre' => ['required', 'string', 'max:80'],
            'config.negocio_eslogan' => ['nullable', 'string', 'max:80'],
            'config.negocio_instagram' => ['nullable', 'string', 'max:80'],
            'config.pedido_minimo' => ['required', 'integer', 'min:0'],
            'config.meta_regalo_activa' => ['boolean'],
            'config.meta_regalo_desde' => ['required', 'integer', 'min:0'],
            'config.meta_regalo_texto' => ['required', 'string', 'max:60'],
            'config.sugerencias_producto' => ['boolean'],
            'config.sugerencias_carrito' => ['boolean'],
            'config.cupon_confirmacion_activo' => ['boolean'],
            'config.cupon_confirmacion_codigo' => ['nullable', 'string', 'max:40'],
            'config.pago_caja' => ['boolean'],
            'config.pago_transferencia' => ['boolean'],
            'config.pago_nequi' => ['boolean'],
            'sedes' => ['array'],
            'sedes.*.id' => ['required', 'integer', 'exists:sedes,id'],
            'sedes.*.nombre' => ['required', 'string', 'max:60'],
            'sedes.*.direccion' => ['nullable', 'string', 'max:120'],
            'sedes.*.whatsapp' => ['nullable', 'string', 'max:30'],
            'sedes.*.tiempo_preparacion' => ['required', 'integer', 'min:1', 'max:240'],
            'sedes.*.recibiendo_pedidos' => ['boolean'],
            'sedes.*.en_menu' => ['boolean'],
            'sedes.*.horarios' => ['array'],
            'sedes.*.horarios.*.dias' => ['required', 'string', 'max:40'],
            'sedes.*.horarios.*.abre' => ['required', 'date_format:H:i'],
            'sedes.*.horarios.*.cierra' => ['required', 'date_format:H:i'],
            'sedes.*.horarios.*.activo' => ['boolean'],
        ], [], [
            'config.negocio_nombre' => 'nombre del negocio',
            'sedes.*.nombre' => 'nombre de la sede',
            'sedes.*.tiempo_preparacion' => 'tiempo de preparación',
        ]);

        $pagos = collect(['pago_caja', 'pago_transferencia', 'pago_nequi'])->filter(fn ($k) => $data['config'][$k] ?? false);
        if ($pagos->isEmpty()) {
            return back()->withErrors(['config.pago_caja' => 'Deja al menos un método de pago activo.']);
        }

        DB::transaction(function () use ($data) {
            Configuracion::guardar($data['config']);

            foreach ($data['sedes'] ?? [] as $sede) {
                Sede::whereKey($sede['id'])->first()?->update([
                    'nombre' => $sede['nombre'],
                    'direccion' => $sede['direccion'] ?? null,
                    'whatsapp' => $sede['whatsapp'] ?? null,
                    'tiempo_preparacion' => $sede['tiempo_preparacion'],
                    'recibiendo_pedidos' => $sede['recibiendo_pedidos'] ?? false,
                    'en_menu' => $sede['en_menu'] ?? false,
                    'horarios' => $sede['horarios'] ?? [],
                ]);
            }
        });

        return back()->with('success', 'Configuración guardada.');
    }
}
