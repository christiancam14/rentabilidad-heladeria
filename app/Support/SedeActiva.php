<?php

namespace App\Support;

use App\Models\Sede;
use Illuminate\Http\Request;

/**
 * Sede que el administrador está gestionando (guardada en sesión).
 */
class SedeActiva
{
    public static function obtener(Request $request): ?Sede
    {
        $id = $request->session()->get('admin_sede_id');

        return ($id ? Sede::find($id) : null) ?? Sede::orderBy('id')->first();
    }
}
