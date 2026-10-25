<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'light') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "light" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: #fbf7f2;
            }

            html.dark {
                background-color: #071f25;
            }
        </style>

        <title inertia>{{ $seo['titulo'] ?? config('app.name', 'A Tu Gusto') }}</title>

        {{-- SEO y vistas previas al compartir: solo las páginas públicas pasan $seo; el resto queda fuera de buscadores --}}
        @isset($seo)
            <meta name="description" content="{{ $seo['descripcion'] }}">
            <meta name="robots" content="index, follow, max-image-preview:large">
            <link rel="canonical" href="{{ $seo['url'] }}">
            <meta property="og:type" content="website">
            <meta property="og:site_name" content="{{ config('app.name', 'A Tu Gusto') }}">
            <meta property="og:locale" content="es_CO">
            <meta property="og:title" content="{{ $seo['titulo'] }}">
            <meta property="og:description" content="{{ $seo['descripcion'] }}">
            <meta property="og:url" content="{{ $seo['url'] }}">
            <meta property="og:image" content="{{ $seo['imagen'] }}">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            <meta property="og:image:alt" content="Heladería A Tu Gusto">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="{{ $seo['titulo'] }}">
            <meta name="twitter:description" content="{{ $seo['descripcion'] }}">
            <meta name="twitter:image" content="{{ $seo['imagen'] }}">
            @if ($seo['json_ld'])
                <script type="application/ld+json">{!! json_encode($seo['json_ld'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) !!}</script>
            @endif
        @else
            <meta name="robots" content="noindex, nofollow">
        @endisset

        <link rel="icon" href="/favicon.ico" sizes="48x48">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <meta name="theme-color" content="#fbf7f2">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
