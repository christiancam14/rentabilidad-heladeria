<?php

use App\Models\CierreMes;
use App\Models\Compra;
use App\Models\ConceptoGastoFijo;
use App\Models\Empleado;
use App\Models\GastoFijoMes;
use App\Models\Insumo;
use App\Models\NominaSemana;
use App\Models\Producto;
use App\Models\Sede;
use App\Models\User;
use App\Models\Venta;
use App\Services\FinanzasConsolidadoService;
use App\Support\FinanzasPeriodo;

/*
 * Valida la fórmula de rentabilidad tal como está definida:
 *   valor_unidad      = precio_insumo / presentación
 *   costo_preparacion = valor_unidad × cantidad_preparacion
 *   costo_total       = Σ costo_preparacion
 *   ganancia          = precio_venta − costo_total
 *   % rentabilidad    = ganancia / precio_venta × 100
 */

function insumo(string $nombre, int $precio, int $presentacion, string $unidad = 'GRAMO'): Insumo
{
    return Insumo::create(compact('nombre', 'precio', 'presentacion', 'unidad'));
}

function producto(string $nombre, int $precio): Producto
{
    return Producto::create([
        'nombre' => $nombre,
        'precio_venta_publico' => $precio,
        'costo_total' => 0,
        'ganancia' => $precio,
        'porcentaje_rentabilidad' => 100,
    ]);
}

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('calcula costo, ganancia y porcentaje de una receta', function () {
    $fresa = insumo('Fresa', 8000, 500);
    $chantilly = insumo('Chantilly', 54000, 3000);
    $producto = producto('Fresas con crema', 14000);

    $this->post("/productos/{$producto->id}/insumos", ['insumo_id' => $fresa->id, 'cantidad_preparacion' => 200])->assertRedirect();
    $this->post("/productos/{$producto->id}/insumos", ['insumo_id' => $chantilly->id, 'cantidad_preparacion' => 80])->assertRedirect();

    $producto->refresh()->load('insumos');

    // Fresa: 8000/500 = 16 × 200 = 3200 · Chantilly: 54000/3000 = 18 × 80 = 1440
    expect((float) $producto->insumos->firstWhere('id', $fresa->id)->pivot->costo_preparacion)->toBe(3200.0)
        ->and((float) $producto->insumos->firstWhere('id', $chantilly->id)->pivot->costo_preparacion)->toBe(1440.0)
        ->and((float) $producto->costo_total)->toBe(4640.0)
        ->and((float) $producto->ganancia)->toBe(9360.0)
        ->and((float) $producto->porcentaje_rentabilidad)->toBe(66.86);
});

it('recalcula al cambiar la cantidad y al quitar un insumo', function () {
    $fresa = insumo('Fresa', 8000, 500);
    $helado = insumo('Helado', 74400, 5000);
    $producto = producto('Copa', 10000);
    $producto->agregarInsumo($fresa, 100);   // 1600
    $producto->agregarInsumo($helado, 150);  // 14.88 × 150 = 2232

    $this->put("/productos/{$producto->id}/insumos/{$fresa->id}", ['cantidad_preparacion' => 50])->assertRedirect(); // 800
    expect((float) $producto->refresh()->costo_total)->toBe(3032.0);

    $this->delete("/productos/{$producto->id}/insumos/{$helado->id}")->assertRedirect();
    expect((float) $producto->refresh()->costo_total)->toBe(800.0)
        ->and((float) $producto->ganancia)->toBe(9200.0)
        ->and((float) $producto->porcentaje_rentabilidad)->toBe(92.0);
});

it('recalcula ganancia y margen al cambiar el precio de venta', function () {
    $fresa = insumo('Fresa', 8000, 500);
    $producto = producto('Copa', 10000);
    $producto->agregarInsumo($fresa, 250); // 4000

    $this->put("/productos/{$producto->id}", ['nombre' => 'Copa', 'precio_venta_publico' => 8000])->assertRedirect();

    expect((float) $producto->refresh()->ganancia)->toBe(4000.0)
        ->and((float) $producto->porcentaje_rentabilidad)->toBe(50.0);
});

it('propaga el nuevo precio de un insumo a todas las recetas que lo usan', function () {
    $fresa = insumo('Fresa', 8000, 500);
    $a = producto('Copa A', 10000);
    $b = producto('Copa B', 20000);
    $a->agregarInsumo($fresa, 100);
    $b->agregarInsumo($fresa, 300);

    $this->put("/insumos/{$fresa->id}", ['nombre' => 'Fresa', 'precio' => 10000, 'unidad' => 'GRAMO', 'presentacion' => 500])
        ->assertRedirect();

    // 10000/500 = 20 por gramo
    expect((float) $a->refresh()->costo_total)->toBe(2000.0)
        ->and((float) $a->porcentaje_rentabilidad)->toBe(80.0)
        ->and((float) $b->refresh()->costo_total)->toBe(6000.0)
        ->and((float) $b->porcentaje_rentabilidad)->toBe(70.0);
});

it('da el mismo costo al agregar un insumo que al actualizar su precio', function () {
    // Presentación que no divide exacto: 1000 / 3 = 333,333…
    $insumo = insumo('Salsa', 1000, 3);
    $producto = producto('Copa', 150000);
    $producto->agregarInsumo($insumo, 300);
    $costoAlAgregar = (float) $producto->refresh()->costo_total;

    // Guardar el insumo con un precio distinto y volver al original fuerza el recálculo masivo
    $this->put("/insumos/{$insumo->id}", ['nombre' => 'Salsa', 'precio' => 2000, 'unidad' => 'GRAMO', 'presentacion' => 3]);
    $this->put("/insumos/{$insumo->id}", ['nombre' => 'Salsa', 'precio' => 1000, 'unidad' => 'GRAMO', 'presentacion' => 3]);

    expect((float) $producto->refresh()->costo_total)->toBe($costoAlAgregar);
});

it('no permite eliminar un insumo que está en una receta', function () {
    $fresa = insumo('Fresa', 8000, 500);
    producto('Copa', 10000)->agregarInsumo($fresa, 100);

    $this->delete("/insumos/{$fresa->id}")->assertRedirect();

    expect(Insumo::find($fresa->id))->not->toBeNull();
});

it('calcula ingresos, costos y ganancias de un cierre de mes', function () {
    $fresa = insumo('Fresa', 8000, 500);
    $copa = producto('Copa', 10000);
    $copa->agregarInsumo($fresa, 250); // costo 4000
    $cierre = CierreMes::create(['anio' => 2026, 'mes' => 9]);

    $this->post("/cierres-mes/{$cierre->id}/productos", ['producto_id' => $copa->id, 'cantidad_vendida' => 30])->assertRedirect();
    $this->post("/cierres-mes/{$cierre->id}/gastos", ['nombre' => 'Arriendo', 'valor' => 50000])->assertRedirect();

    expect($cierre->calcularIngresos())->toEqual(300000)
        ->and($cierre->calcularCostos())->toEqual(120000)
        ->and($cierre->calcularGananciaBruta())->toEqual(180000)
        ->and($cierre->calcularTotalGastos())->toEqual(50000)
        ->and($cierre->calcularGananciaNeta())->toEqual(130000);
});

it('congela precio y costo del producto en el cierre aunque luego cambien', function () {
    $fresa = insumo('Fresa', 8000, 500);
    $copa = producto('Copa', 10000);
    $copa->agregarInsumo($fresa, 250);
    $cierre = CierreMes::create(['anio' => 2026, 'mes' => 9]);
    $cierre->agregarProducto($copa, 30);

    $this->put("/productos/{$copa->id}", ['nombre' => 'Copa', 'precio_venta_publico' => 12000]);

    expect($cierre->calcularIngresos())->toEqual(300000);
});

it('mantiene el precio congelado al corregir solo la cantidad vendida', function () {
    $copa = producto('Copa', 10000);
    $cierre = CierreMes::create(['anio' => 2026, 'mes' => 9]);
    $cierre->agregarProducto($copa, 30);

    $this->put("/productos/{$copa->id}", ['nombre' => 'Copa', 'precio_venta_publico' => 12000]);
    $this->put("/cierres-mes/{$cierre->id}/productos/{$copa->id}", ['producto_id' => $copa->id, 'cantidad_vendida' => 31]);

    // 31 × 10.000 (precio del mes cerrado), no 31 × 12.000
    expect($cierre->calcularIngresos())->toEqual(310000);
});

it('conserva las ventas históricas si se elimina un producto', function () {
    $copa = producto('Copa', 10000);
    $cierre = CierreMes::create(['anio' => 2026, 'mes' => 9]);
    $cierre->agregarProducto($copa, 30);

    $this->delete("/productos/{$copa->id}");

    expect($cierre->calcularIngresos())->toEqual(300000);
});

it('consolida entradas y salidas del mes', function () {
    $sede = Sede::create(['nombre' => 'Rocío', 'slug' => 'rocio']);
    Venta::create(['sede_id' => $sede->id, 'fecha' => '2026-09-10', 'nombre' => 'Caja', 'efectivo' => 500000, 'transferencia' => 300000]);
    Venta::create(['sede_id' => $sede->id, 'fecha' => '2026-10-01', 'nombre' => 'Otro mes', 'efectivo' => 999999, 'transferencia' => 0]);
    Compra::create(['fecha' => '2026-09-12', 'nombre' => 'Leche', 'efectivo' => 100000, 'transferencia' => 50000]);
    $concepto = ConceptoGastoFijo::create(['sede_id' => $sede->id, 'nombre' => 'Arriendo']);
    GastoFijoMes::create(['concepto_gasto_fijo_id' => $concepto->id, 'anio' => 2026, 'mes' => 9, 'valor' => 200000]);
    $empleado = Empleado::create(['nombre' => 'Ana', 'valor_turno_completo' => 50000, 'valor_medio_turno' => 25000, 'activo' => true]);
    NominaSemana::create([
        'empleado_id' => $empleado->id, 'anio' => 2026, 'mes' => 9, 'semana' => 1,
        'dias_turno_completo' => 2, 'valor_turno_completo' => 50000, 'dias_medio_turno' => 1, 'valor_medio_turno' => 25000,
        'pago_semana' => NominaSemana::calcularPagoSemana(2, 50000, 1, 25000),
    ]);

    $r = app(FinanzasConsolidadoService::class)->calcular(new FinanzasPeriodo(2026, 9));

    expect($r['entradas']['total'])->toBe(800000)
        ->and($r['salidas']['compras'])->toBe(150000)
        ->and($r['salidas']['gastos_fijos_total'])->toBe(200000)
        ->and($r['salidas']['nomina'])->toBe(125000)
        ->and($r['salidas']['total'])->toBe(475000)
        ->and($r['ganancia'])->toBe(325000);
});

it('permite registrar la quinta semana de nómina en meses que la tienen', function () {
    $empleado = Empleado::create(['nombre' => 'Ana', 'valor_turno_completo' => 50000, 'valor_medio_turno' => 25000, 'activo' => true]);

    $this->post('/finanzas/nomina/semanas?anio=2026&mes=8', [
        'empleado_id' => $empleado->id, 'semana' => 5,
        'dias_turno_completo' => 1, 'valor_turno_completo' => 50000, 'dias_medio_turno' => 0, 'valor_medio_turno' => 25000,
    ])->assertSessionHasNoErrors();
});

it('conserva el historial de gastos fijos al eliminar un concepto', function () {
    $sede = Sede::create(['nombre' => 'Rocío', 'slug' => 'rocio']);
    $concepto = ConceptoGastoFijo::create(['sede_id' => $sede->id, 'nombre' => 'Vigilancia']);
    GastoFijoMes::create(['concepto_gasto_fijo_id' => $concepto->id, 'anio' => 2026, 'mes' => 8, 'valor' => 90000]);

    $this->delete("/finanzas/gastos-fijos/conceptos/{$concepto->id}?anio=2026&mes=10");

    expect(app(FinanzasConsolidadoService::class)->calcular(new FinanzasPeriodo(2026, 8))['salidas']['gastos_fijos_total'])->toBe(90000);
});

it('sí elimina un producto que nunca se vendió', function () {
    $copa = producto('Copa nueva', 10000);

    $this->delete("/productos/{$copa->id}")->assertRedirect();

    expect(Producto::find($copa->id))->toBeNull();
});

it('quita un concepto desde el mes elegido y lo conserva en los anteriores', function () {
    $sede = Sede::create(['nombre' => 'Rocío', 'slug' => 'rocio']);
    $concepto = ConceptoGastoFijo::create(['sede_id' => $sede->id, 'nombre' => 'Vigilancia']);
    GastoFijoMes::create(['concepto_gasto_fijo_id' => $concepto->id, 'anio' => 2026, 'mes' => 9, 'valor' => 90000]);
    GastoFijoMes::create(['concepto_gasto_fijo_id' => $concepto->id, 'anio' => 2026, 'mes' => 10, 'valor' => 90000]);

    $this->delete("/finanzas/gastos-fijos/conceptos/{$concepto->id}?anio=2026&mes=10");

    $nombres = fn (int $mes) => collect($this->get("/finanzas/gastos-fijos?anio=2026&mes={$mes}&sede_id={$sede->id}")
        ->viewData('page')['props']['conceptos'])->pluck('nombre');

    expect($nombres(9))->toContain('Vigilancia')
        ->and($nombres(10))->not->toContain('Vigilancia')
        ->and(GastoFijoMes::where('mes', 10)->exists())->toBeFalse();

    // Volver a crearlo lo reactiva en lugar de duplicarlo
    $this->post('/finanzas/gastos-fijos/conceptos?anio=2026&mes=11', ['sede_id' => $sede->id, 'nombre' => 'Vigilancia']);
    expect(ConceptoGastoFijo::where('nombre', 'Vigilancia')->count())->toBe(1)
        ->and($nombres(11))->toContain('Vigilancia');
});

it('carga todas las pantallas de rentabilidad', function () {
    $producto = producto('Copa', 10000);
    $cierre = CierreMes::create(['anio' => 2026, 'mes' => 9]);

    foreach (['/dashboard', '/insumos', '/insumos/create', '/productos', "/productos/{$producto->id}", '/cierres-mes', "/cierres-mes/{$cierre->id}",
        '/finanzas/consolidado', '/finanzas/ventas', '/finanzas/compras', '/finanzas/nomina', '/finanzas/gastos-fijos', '/finanzas/tarjeta-bbva'] as $url) {
        $this->get($url)->assertOk();
    }
});
