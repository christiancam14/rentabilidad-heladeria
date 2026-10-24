<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Support\SedeActiva;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pedidos en vivo de la sede activa (tablero tipo kanban).
 */
class PedidoController extends Controller
{
    public function index(Request $request): Response
    {
        $sede = SedeActiva::obtener($request);
        $hoy = now()->startOfDay();

        $pedidos = Pedido::with('items')
            ->where('sede_id', $sede?->id)
            ->where(fn ($q) => $q->where('created_at', '>=', $hoy)->orWhereIn('estado', ['nuevo', 'preparando', 'listo']))
            ->orderBy('created_at')
            ->get();

        $validos = $pedidos->where('created_at', '>=', $hoy)->where('estado', '!=', 'cancelado');
        $ventasHoy = (int) $validos->sum('total');

        // Comparación contra el mismo día de la semana pasada, hasta la misma hora
        $semanaPasada = Pedido::where('sede_id', $sede?->id)
            ->where('estado', '!=', 'cancelado')
            ->whereBetween('created_at', [$hoy->copy()->subWeek(), now()->subWeek()])
            ->sum('total');

        $masVendido = PedidoItem::query()
            ->whereIn('pedido_id', $validos->pluck('id'))
            ->selectRaw('nombre, SUM(cantidad) as unidades')
            ->groupBy('nombre')
            ->orderByDesc('unidades')
            ->first();

        return Inertia::render('admin/pedidos/index', [
            'sede' => $sede ? [
                'id' => $sede->id,
                'nombre' => $sede->nombre,
                'recibiendo_pedidos' => $sede->recibiendo_pedidos,
            ] : null,
            'kpis' => [
                'ventas' => $ventasHoy,
                'variacion' => $semanaPasada > 0 ? round(($ventasHoy - $semanaPasada) / $semanaPasada * 100) : null,
                'dia_comparado' => $hoy->copy()->subWeek()->locale('es')->isoFormat('dddd'),
                'pedidos' => $validos->count(),
                'en_curso' => $pedidos->whereIn('estado', Pedido::EN_CURSO)->count(),
                'ticket_promedio' => $validos->count() ? (int) round($ventasHoy / $validos->count()) : 0,
                'mas_vendido' => $masVendido ? ['nombre' => $masVendido->nombre, 'unidades' => (int) $masVendido->unidades] : null,
            ],
            'pedidos' => $pedidos->map(fn (Pedido $p) => [
                'id' => $p->id,
                'codigo' => $p->codigo,
                'estado' => $p->estado,
                'cliente_nombre' => $p->cliente_nombre,
                'cliente_telefono' => $p->cliente_telefono,
                'metodo_pago' => Pedido::METODOS_PAGO[$p->metodo_pago] ?? $p->metodo_pago,
                'notas' => $p->notas,
                'regalo' => $p->regalo,
                'cupon' => $p->cupon,
                'total' => $p->total,
                'creado' => $p->created_at->toIso8601String(),
                'items' => $p->items->map(fn ($i) => [
                    'cantidad' => $i->cantidad,
                    'nombre' => $i->nombre,
                    'detalle' => $i->detalle,
                ]),
            ])->values(),
        ]);
    }

    public function update(Request $request, Pedido $pedido): RedirectResponse
    {
        $data = $request->validate([
            'estado' => ['required', Rule::in(Pedido::ESTADOS)],
        ]);

        $pedido->update($data);

        return back();
    }
}
