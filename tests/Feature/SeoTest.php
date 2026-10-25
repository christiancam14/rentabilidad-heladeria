<?php

use App\Models\Sede;
use App\Models\User;

beforeEach(function () {
    Sede::create(['nombre' => 'Rocío', 'slug' => 'rocio', 'whatsapp' => '3046155628', 'maps_url' => 'https://maps.app.goo.gl/x']);
    Sede::create(['nombre' => 'Marsella', 'slug' => 'marsella']);
});

/** @return array<string, mixed> */
function jsonLd(string $html): array
{
    preg_match('#<script type="application/ld\+json">(.*?)</script>#s', $html, $m);

    return json_decode($m[1] ?? 'null', true) ?? [];
}

it('incluye metadatos para buscadores y vista previa en el menú', function () {
    $html = $this->get('/')->assertOk()->getContent();

    expect($html)
        ->toContain('<meta name="robots" content="index, follow')
        ->toContain('<meta property="og:title" content="Menú · Pide para recoger - A Tu Gusto">')
        ->toContain('<meta property="og:image" content="'.url('/brand/og-menu.jpg').'">')
        ->toContain('<link rel="canonical" href="'.url('/').'">')
        ->toContain('recoge en Rocío o Marsella');
});

it('describe las sedes como heladerías con horarios y teléfono', function () {
    $grafo = jsonLd($this->get('/links')->getContent())['@graph'];
    $rocio = collect($grafo)->firstWhere('@id', url('/').'#sede-rocio');

    expect(collect($grafo)->pluck('@type')->all())->toBe(['Organization', 'IceCreamShop', 'IceCreamShop'])
        ->and($rocio['telephone'])->toBe('+573046155628')
        ->and($rocio['hasMap'])->toBe('https://maps.app.goo.gl/x')
        ->and($rocio['openingHoursSpecification'][0]['dayOfWeek'])->toBe([
            'https://schema.org/Monday', 'https://schema.org/Tuesday', 'https://schema.org/Wednesday', 'https://schema.org/Thursday',
        ])
        ->and($rocio['openingHoursSpecification'][1]['dayOfWeek'])->toBe(['https://schema.org/Friday', 'https://schema.org/Saturday'])
        ->and($rocio['openingHoursSpecification'][2]['opens'])->toBe('14:00');
});

it('mantiene el panel y el login fuera de los buscadores', function () {
    expect($this->get('/login')->getContent())->toContain('<meta name="robots" content="noindex, nofollow">');

    $this->actingAs(User::factory()->create());
    $html = $this->get('/dashboard')->getContent();
    expect($html)->toContain('noindex, nofollow')->not->toContain('og:title');
});

it('genera robots.txt y sitemap.xml con el dominio actual', function () {
    $this->get('/robots.txt')->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('Disallow: /admin', false)
        ->assertSee('Sitemap: '.url('/sitemap.xml'), false);

    $xml = simplexml_load_string($this->get('/sitemap.xml')->assertOk()->getContent());
    $urls = [];
    foreach ($xml->url as $u) {
        $urls[] = (string) $u->loc;
    }
    expect($urls)->toBe([url('/'), url('/links')]);
});
