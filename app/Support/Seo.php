<?php

namespace App\Support;

use App\Models\Configuracion;
use App\Models\Sede;
use Illuminate\Support\Str;

/**
 * Metadatos para buscadores y vistas previas al compartir (WhatsApp, Instagram, Facebook).
 * Se imprimen en el HTML desde el servidor porque esos rastreadores no ejecutan JavaScript.
 * Las páginas que no pasan datos de SEO (panel, login, pedidos) quedan como noindex.
 */
class Seo
{
    /** Imagen de 1200×630 para las vistas previas. */
    public const IMAGEN = '/brand/og-menu.jpg';

    /**
     * @return array{titulo: string, descripcion: string, url: string, imagen: string, indexar: bool, json_ld: ?array<string, mixed>}
     */
    public static function pagina(string $titulo, string $descripcion, string $ruta, bool $conNegocio = false): array
    {
        return [
            'titulo' => $titulo.' - '.self::marca(),
            'descripcion' => Str::limit($descripcion, 160, '…'),
            'url' => url($ruta),
            'imagen' => url(self::IMAGEN),
            'indexar' => true,
            'json_ld' => $conNegocio ? self::datosNegocio() : null,
        ];
    }

    public static function marca(): string
    {
        return 'A Tu Gusto';
    }

    /**
     * Datos estructurados (schema.org): la marca y una heladería por cada sede visible.
     *
     * @return array<string, mixed>
     */
    public static function datosNegocio(): array
    {
        $config = Configuracion::todas();
        $organizacion = url('/').'#negocio';
        $redes = array_values(array_filter([
            $config['negocio_instagram'] ?? null,
            $config['negocio_facebook'] ?? null,
            $config['negocio_tiktok'] ?? null,
        ]));

        $grafo = [[
            '@type' => 'Organization',
            '@id' => $organizacion,
            'name' => $config['negocio_nombre'],
            'url' => url('/'),
            'logo' => url('/brand/logo-2026-turquesa.svg'),
            'sameAs' => $redes,
        ]];

        foreach (Sede::where('en_menu', true)->orderBy('id')->get() as $sede) {
            $grafo[] = array_filter([
                '@type' => 'IceCreamShop',
                '@id' => url('/').'#sede-'.$sede->slug,
                'name' => $config['negocio_nombre'].' '.$sede->nombre,
                'url' => url('/').'?sede='.$sede->slug,
                'image' => url(self::IMAGEN),
                'telephone' => self::telefono($sede->whatsapp),
                'hasMap' => $sede->maps_url,
                'servesCuisine' => 'Helados',
                'priceRange' => '$$',
                'hasMenu' => url('/').'?sede='.$sede->slug,
                'parentOrganization' => ['@id' => $organizacion],
                'sameAs' => $redes ?: null,
                'address' => array_filter([
                    '@type' => 'PostalAddress',
                    'streetAddress' => $sede->direccion,
                    'addressRegion' => 'Santander',
                    'addressCountry' => 'CO',
                ]),
                'openingHoursSpecification' => self::horarios($sede->horarios ?: Sede::HORARIOS_DEFAULT) ?: null,
            ], fn ($valor) => $valor !== null && $valor !== '');
        }

        return ['@context' => 'https://schema.org', '@graph' => $grafo];
    }

    private static function telefono(?string $numero): ?string
    {
        $digitos = preg_replace('/\D/', '', (string) $numero);

        return match (true) {
            $digitos === '' => null,
            strlen($digitos) === 10 => '+57'.$digitos,
            default => '+'.$digitos,
        };
    }

    /**
     * Convierte horarios como "Lunes a jueves 14:00–22:00" en OpeningHoursSpecification.
     *
     * @param  array<int, array{dias: string, abre: string, cierra: string, activo?: bool}>  $horarios
     * @return array<int, array<string, mixed>>
     */
    private static function horarios(array $horarios): array
    {
        $semana = ['lunes' => 'Monday', 'martes' => 'Tuesday', 'miercoles' => 'Wednesday', 'jueves' => 'Thursday',
            'viernes' => 'Friday', 'sabado' => 'Saturday', 'domingo' => 'Sunday'];
        $orden = array_keys($semana);

        $resultado = [];
        foreach ($horarios as $h) {
            if (! ($h['activo'] ?? true)) {
                continue;
            }

            $texto = Str::of($h['dias'])->ascii()->lower()->value();
            preg_match_all('/'.implode('|', $orden).'/', $texto, $encontrados);
            $dias = $encontrados[0];

            // "lunes a jueves" = rango; "viernes y sábado" = lista
            if (count($dias) === 2 && str_contains($texto, $dias[0].' a '.$dias[1])) {
                $dias = array_slice($orden, array_search($dias[0], $orden), array_search($dias[1], $orden) - array_search($dias[0], $orden) + 1);
            }

            if ($dias) {
                $resultado[] = [
                    '@type' => 'OpeningHoursSpecification',
                    'dayOfWeek' => array_map(fn ($d) => 'https://schema.org/'.$semana[$d], array_values(array_unique($dias))),
                    'opens' => $h['abre'],
                    'closes' => $h['cierra'],
                ];
            }
        }

        return $resultado;
    }
}
