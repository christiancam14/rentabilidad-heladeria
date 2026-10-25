<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use App\Models\Cupon;
use App\Models\Pedido;
use App\Models\Sede;
use App\Services\MenuCatalogo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PedidoPublicoController extends Controller
{
    public function store(Request $request, MenuCatalogo $catalogo): RedirectResponse
    {
        $config = Configuracion::todas();

        $data = $request->validate([
            'sede_id' => ['required', 'integer', 'exists:sedes,id'],
            'cliente_nombre' => ['required', 'string', 'max:80'],
            'cliente_telefono' => ['required', 'string', 'max:30', 'regex:/^[0-9+\s()-]{7,}$/'],
            'metodo_pago' => ['required', Rule::in(array_keys(Pedido::metodosHabilitados($config)))],
            'notas' => ['nullable', 'string', 'max:500'],
            'cupon' => ['nullable', 'string', 'max:40'],
            'items' => ['required', 'array', 'min:1', 'max:40'],
            'items.*.producto_id' => ['required', 'integer'],
            'items.*.cantidad' => ['required', 'integer', 'min:1', 'max:30'],
            'items.*.tamano_id' => ['nullable', 'integer'],
            'items.*.opciones' => ['nullable', 'array', 'max:20'],
            'items.*.opciones.*' => ['integer'],
        ], [
            'cliente_nombre.required' => 'Cuéntanos tu nombre.',
            'cliente_telefono.required' => 'Necesitamos tu WhatsApp para confirmarte.',
            'cliente_telefono.regex' => 'Revisa el número de WhatsApp.',
            'items.required' => 'Tu pedido está vacío.',
        ]);

        $sede = Sede::findOrFail($data['sede_id']);
        if (! $sede->en_menu || ! $sede->recibiendo_pedidos) {
            throw ValidationException::withMessages(['sede_id' => "La sede {$sede->nombre} no está recibiendo pedidos en este momento."]);
        }

        $lineas = collect($data['items'])->map(
            fn ($item, $i) => $catalogo->cotizarLinea($item, $sede->id, "items.$i")
        );

        $subtotal = (int) $lineas->sum('total');

        if ($subtotal < (int) $config['pedido_minimo']) {
            throw ValidationException::withMessages(['items' => 'El pedido mínimo es de $'.number_format($config['pedido_minimo'], 0, ',', '.').'.']);
        }

        $descuento = 0;
        $cupon = null;
        if (! empty($data['cupon'])) {
            $cupon = Cupon::buscarActivo($data['cupon']);
            if (! $cupon) {
                throw ValidationException::withMessages(['cupon' => 'Ese cupón no existe o ya no está activo.']);
            }
            $descuento = (int) round($subtotal * $cupon->porcentaje / 100);
        }

        $regalo = null;
        if ($config['meta_regalo_activa'] && $subtotal >= (int) $config['meta_regalo_desde']) {
            $regalo = $config['meta_regalo_texto'];
        }

        $pedido = DB::transaction(function () use ($data, $sede, $lineas, $subtotal, $descuento, $cupon, $regalo) {
            $pedido = Pedido::create([
                'sede_id' => $sede->id,
                'cliente_nombre' => trim($data['cliente_nombre']),
                'cliente_telefono' => trim($data['cliente_telefono']),
                'metodo_pago' => $data['metodo_pago'],
                'notas' => $data['notas'] ?? null,
                'cupon' => $cupon?->codigo,
                'regalo' => $regalo,
                'subtotal' => $subtotal,
                'descuento' => $descuento,
                'total' => $subtotal - $descuento,
                'estado' => 'nuevo',
                'listo_estimado' => now()->addMinutes($sede->tiempo_preparacion),
            ]);

            foreach ($lineas as $linea) {
                $pedido->items()->create([
                    'producto_id' => $linea['producto']->id,
                    'nombre' => $linea['nombre'],
                    'detalle' => $linea['detalle'],
                    'cantidad' => $linea['cantidad'],
                    'precio_unitario' => $linea['precio_unitario'],
                    'total' => $linea['total'],
                ]);
            }

            return $pedido;
        });

        return redirect()->route('pedido.show', ['token' => $pedido->token, 'enviar' => 1]);
    }

    /** Valida un cupón desde el carrito (JSON). */
    public function cupon(string $codigo): JsonResponse
    {
        $cupon = Cupon::buscarActivo($codigo);

        return $cupon
            ? response()->json(['codigo' => $cupon->codigo, 'porcentaje' => $cupon->porcentaje])
            : response()->json(['message' => 'Ese cupón no existe o ya no está activo.'], 404);
    }

    public function show(Request $request, string $token): Response
    {
        $pedido = Pedido::with(['items', 'sede'])->where('token', $token)->firstOrFail();
        $config = Configuracion::todas();

        $cupon = null;
        if ($config['cupon_confirmacion_activo']) {
            $cupon = Cupon::buscarActivo($config['cupon_confirmacion_codigo']);
        }

        return Inertia::render('menu/pedido', [
            'pedido' => [
                'codigo' => $pedido->codigo,
                'estado' => $pedido->estado,
                'cliente_nombre' => $pedido->cliente_nombre,
                'metodo_pago' => Pedido::METODOS_PAGO[$pedido->metodo_pago] ?? $pedido->metodo_pago,
                'subtotal' => $pedido->subtotal,
                'descuento' => $pedido->descuento,
                'total' => $pedido->total,
                'regalo' => $pedido->regalo,
                'listo_estimado' => $pedido->listo_estimado?->toIso8601String(),
                'items' => $pedido->items->map(fn ($i) => [
                    'nombre' => $i->nombre,
                    'detalle' => $i->detalle,
                    'cantidad' => $i->cantidad,
                    'total' => $i->total,
                ]),
            ],
            'sede' => [
                'nombre' => $pedido->sede->nombre,
                'slug' => $pedido->sede->slug,
                'direccion' => $pedido->sede->direccion,
                'maps_url' => $pedido->sede->maps_url,
            ],
            'whatsapp_url' => $this->whatsappUrl($pedido),
            'enviar' => $request->boolean('enviar') && $pedido->created_at->gt(now()->subMinutes(5)),
            'cupon' => $cupon ? ['codigo' => $cupon->codigo, 'porcentaje' => $cupon->porcentaje] : null,
        ]);
    }

    private function whatsappUrl(Pedido $pedido): ?string
    {
        if (! $pedido->sede->whatsappUrl()) {
            return null;
        }

        $peso = fn (int $v) => '$'.number_format($v, 0, ',', '.');
        $lineas = [
            "¡Hola! Acabo de hacer el pedido *#{$pedido->codigo}* para recoger en {$pedido->sede->nombre} 🍨",
            '',
        ];
        foreach ($pedido->items as $item) {
            $lineas[] = "{$item->cantidad}× {$item->nombre}".($item->detalle ? " ({$item->detalle})" : '').' — '.$peso($item->total);
        }
        $lineas[] = '';
        if ($pedido->descuento > 0) {
            $lineas[] = "Cupón {$pedido->cupon}: -".$peso($pedido->descuento);
        }
        if ($pedido->regalo) {
            $lineas[] = "🎁 {$pedido->regalo}";
        }
        $lineas[] = '*Total: '.$peso($pedido->total).'* · '.(Pedido::METODOS_PAGO[$pedido->metodo_pago] ?? $pedido->metodo_pago);
        $lineas[] = "A nombre de {$pedido->cliente_nombre}";
        if ($pedido->notas) {
            $lineas[] = "Notas: {$pedido->notas}";
        }

        return $pedido->sede->whatsappUrl(implode("\n", $lineas));
    }
}
