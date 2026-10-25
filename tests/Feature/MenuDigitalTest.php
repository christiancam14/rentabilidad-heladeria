<?php

use App\Models\Categoria;
use App\Models\Configuracion;
use App\Models\Opcion;
use App\Models\Pedido;
use App\Models\Producto;
use App\Models\Sede;
use App\Models\User;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->sede = Sede::create(['nombre' => 'Provenza', 'slug' => 'provenza', 'whatsapp' => '3046155628']);
    $categoria = Categoria::create(['nombre' => 'Copas', 'slug' => 'copas']);

    $this->copa = Producto::create([
        'categoria_id' => $categoria->id,
        'nombre' => 'Copa Brownie',
        'precio_venta_publico' => 12000,
        'costo_total' => 0,
        'ganancia' => 12000,
        'porcentaje_rentabilidad' => 100,
        'visible_menu' => true,
    ]);

    $this->grande = $this->copa->tamanos()->create(['nombre' => 'Grande', 'ajuste_precio' => 3000]);

    $this->brownie = Opcion::create(['tipo' => 'sabor', 'nombre' => 'Brownie']);
    $this->arequipe = Opcion::create(['tipo' => 'sabor', 'nombre' => 'Arequipe']);
    $this->nutella = Opcion::create(['tipo' => 'adicional', 'nombre' => 'Nutella', 'precio' => 2500]);

    $this->copa->grupos()->create(['nombre' => 'Elige 2 sabores', 'tipo' => 'sabor', 'obligatorio' => true, 'max_selecciones' => 2])
        ->opciones()->sync([$this->brownie->id, $this->arequipe->id]);
    $this->copa->grupos()->create(['nombre' => 'Adicionales', 'tipo' => 'adicional', 'max_selecciones' => 3])
        ->opciones()->sync([$this->nutella->id]);
});

function pedidoValido(array $cambios = []): array
{
    return array_merge([
        'sede_id' => test()->sede->id,
        'cliente_nombre' => 'Laura',
        'cliente_telefono' => '3100000000',
        'metodo_pago' => 'caja',
        'items' => [[
            'producto_id' => test()->copa->id,
            'cantidad' => 2,
            'tamano_id' => test()->grande->id,
            'opciones' => [test()->brownie->id, test()->arequipe->id, test()->nutella->id],
        ]],
    ], $cambios);
}

it('muestra el menú con los productos visibles', function () {
    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->component('menu/index')
        ->where('sede_id', $this->sede->id)
        ->has('productos', 1)
        ->where('productos.0.nombre', 'Copa Brownie')
    );
});

it('crea el pedido recalculando el precio en el servidor', function () {
    $response = $this->post('/pedidos', pedidoValido());

    $pedido = Pedido::with('items')->sole();
    $response->assertRedirect(route('pedido.show', ['token' => $pedido->token, 'enviar' => 1]));

    // (12.000 + 3.000 grande + 2.500 nutella) × 2
    expect($pedido->total)->toBe(35000)
        ->and($pedido->codigo)->toBe('A-'.(100 + $pedido->id))
        ->and($pedido->items->first()->detalle)->toContain('Grande')
        ->and($pedido->estado)->toBe('nuevo');
});

it('exige completar los grupos obligatorios', function () {
    $datos = pedidoValido();
    $datos['items'][0]['opciones'] = [$this->nutella->id];

    $this->post('/pedidos', $datos)->assertSessionHasErrors('items.0');
    expect(Pedido::count())->toBe(0);
});

it('rechaza pedidos cuando la sede está en pausa', function () {
    $this->sede->update(['recibiendo_pedidos' => false]);

    $this->post('/pedidos', pedidoValido())->assertSessionHasErrors('sede_id');
});

it('rechaza productos agotados', function () {
    $this->copa->update(['agotado' => true]);

    $this->post('/pedidos', pedidoValido())->assertSessionHasErrors('items.0');
});

it('protege el panel de pedidos', function () {
    $this->get('/admin/pedidos')->assertRedirect('/login');
});

it('permite al admin avanzar el estado del pedido', function () {
    $this->post('/pedidos', pedidoValido());
    $pedido = Pedido::sole();

    $this->actingAs(User::factory()->create())
        ->patch("/admin/pedidos/{$pedido->id}", ['estado' => 'preparando'])
        ->assertRedirect();

    expect($pedido->fresh()->estado)->toBe('preparando');
});

it('muestra la página de enlaces con redes, WhatsApp y ubicación de cada sede', function () {
    $this->sede->update(['maps_url' => 'https://maps.app.goo.gl/abc']);

    $this->get('/links')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('links')
        ->where('negocio.redes.instagram', 'https://www.instagram.com/heladeriaatugusto/')
        ->where('sedes.0.maps_url', 'https://maps.app.goo.gl/abc')
        ->where('sedes.0.whatsapp_url', fn ($url) => str_starts_with($url, 'https://wa.me/573046155628?text='))
    );
});

it('guarda las redes sociales y el enlace de Maps desde la configuración', function () {
    $this->actingAs(User::factory()->create());
    $props = $this->get('/admin/configuracion')->viewData('page')['props'];

    $config = [...$props['config'], 'negocio_tiktok' => 'https://www.tiktok.com/@otra'];
    $sedes = collect($props['sedes'])->map(fn ($s) => [...$s, 'maps_url' => 'https://maps.app.goo.gl/nuevo'])->all();

    $this->put('/admin/configuracion', ['config' => $config, 'sedes' => $sedes])->assertSessionHasNoErrors();

    expect(Configuracion::obtener('negocio_tiktok'))->toBe('https://www.tiktok.com/@otra')
        ->and($this->sede->fresh()->maps_url)->toBe('https://maps.app.goo.gl/nuevo');

    $this->put('/admin/configuracion', ['config' => [...$config, 'negocio_facebook' => 'no es un enlace'], 'sedes' => $sedes])
        ->assertSessionHasErrors('config.negocio_facebook');
});

it('avisa al grupo de Telegram cuando entra un pedido', function () {
    config(['services.telegram.bot_token' => '123:abc', 'services.telegram.chat_id' => '-100555']);
    Http::fake(['api.telegram.org/*' => Http::response(['ok' => true])]);

    $this->post('/pedidos', pedidoValido(['notas' => 'Sin <cereza>']))->assertRedirect();

    Http::assertSent(function (HttpRequest $request) {
        return $request->url() === 'https://api.telegram.org/bot123:abc/sendMessage'
            && $request['chat_id'] === '-100555'
            && $request['parse_mode'] === 'HTML'
            && str_contains($request['text'], 'Nuevo pedido #A-')
            && str_contains($request['text'], '2×</b> Copa Brownie')
            && str_contains($request['text'], 'Sin &lt;cereza&gt;')
            && str_contains($request['text'], 'Total: $35.000')
            && str_starts_with($request['reply_markup']['inline_keyboard'][0][0]['url'], 'https://wa.me/573100000000');
    });
});

it('guarda el pedido aunque Telegram falle o no esté configurado', function () {
    config(['services.telegram.bot_token' => '123:abc', 'services.telegram.chat_id' => '-100555']);
    Http::fake(['api.telegram.org/*' => Http::response(['ok' => false, 'description' => 'chat not found'], 400)]);

    $this->post('/pedidos', pedidoValido())->assertRedirect();
    expect(Pedido::count())->toBe(1);

    config(['services.telegram.bot_token' => null]);
    $this->post('/pedidos', pedidoValido())->assertRedirect();
    expect(Pedido::count())->toBe(2);
});
