<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sede;
use App\Support\SedeActiva;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SedeActivaController extends Controller
{
    public function cambiar(Request $request): RedirectResponse
    {
        $data = $request->validate(['sede_id' => ['required', 'integer', 'exists:sedes,id']]);
        $request->session()->put('admin_sede_id', (int) $data['sede_id']);

        return back();
    }

    public function recibiendo(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'sede_id' => ['nullable', 'integer', 'exists:sedes,id'],
            'recibiendo_pedidos' => ['required', 'boolean'],
        ]);

        $sede = isset($data['sede_id']) ? Sede::findOrFail($data['sede_id']) : SedeActiva::obtener($request);
        $sede?->update(['recibiendo_pedidos' => $data['recibiendo_pedidos']]);

        return back()->with('success', $data['recibiendo_pedidos'] ? 'Sede recibiendo pedidos.' : 'Pedidos en pausa.');
    }
}
