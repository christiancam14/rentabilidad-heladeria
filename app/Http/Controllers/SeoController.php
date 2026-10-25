<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Response;

/**
 * robots.txt y sitemap.xml generados con el dominio real del despliegue.
 */
class SeoController extends Controller
{
    /** Rutas privadas que no deben aparecer en buscadores (además, todas exigen sesión). */
    private const PRIVADAS = ['/admin', '/dashboard', '/insumos', '/productos', '/cierres-mes', '/finanzas',
        '/settings', '/login', '/register', '/forgot-password', '/reset-password', '/two-factor-challenge',
        '/pedido/', '/pedidos', '/cupon/'];

    public function robots(): Response
    {
        $lineas = ['User-agent: *', 'Allow: /'];
        foreach (self::PRIVADAS as $ruta) {
            $lineas[] = 'Disallow: '.$ruta;
        }
        $lineas[] = '';
        $lineas[] = 'Sitemap: '.url('/sitemap.xml');

        return response(implode("\n", $lineas)."\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function sitemap(): Response
    {
        $actualizado = Producto::where('visible_menu', true)->max('updated_at');
        $fecha = $actualizado ? date('Y-m-d', strtotime($actualizado)) : now()->toDateString();

        $urls = [
            ['loc' => url('/'), 'prioridad' => '1.0', 'frecuencia' => 'daily'],
            ['loc' => url('/links'), 'prioridad' => '0.6', 'frecuencia' => 'monthly'],
        ];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($urls as $u) {
            $xml .= "  <url><loc>{$u['loc']}</loc><lastmod>{$fecha}</lastmod><changefreq>{$u['frecuencia']}</changefreq><priority>{$u['prioridad']}</priority></url>\n";
        }
        $xml .= '</urlset>'."\n";

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
