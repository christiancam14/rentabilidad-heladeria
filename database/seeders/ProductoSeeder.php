<?php

namespace Database\Seeders;

use App\Models\Insumo;
use App\Models\Producto;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usar transacción para mejorar el rendimiento
        \DB::transaction(function () {
            // Obtener todos los insumos una vez para evitar múltiples consultas
            // Recargar para asegurar que tenemos los datos más recientes
            // Usar uppercase para normalizar los nombres (case-insensitive)
            $insumos = Insumo::query()->get()->keyBy(function ($insumo) {
                return strtoupper($insumo->nombre);
            });

            // Verificar que tenemos insumos
            if ($insumos->isEmpty()) {
                throw new \Exception("No se encontraron insumos en la base de datos. Por favor ejecuta InsumoSeeder primero.");
            }

            // Función helper para obtener insumo por nombre con validación (case-insensitive)
            $getInsumo = function ($nombre) use ($insumos) {
                $nombreUpper = strtoupper($nombre);
                $insumo = $insumos->get($nombreUpper);
                if (!$insumo) {
                    // Mostrar algunos nombres disponibles para debugging
                    $ejemplos = $insumos->keys()->take(5)->implode(', ');
                    throw new \Exception("El insumo '{$nombre}' no existe en la base de datos. Ejemplos de insumos disponibles: {$ejemplos}. Total insumos: {$insumos->count()}. Por favor ejecuta InsumoSeeder primero.");
                }
                return $insumo;
            };

            $this->seedProductos($getInsumo);
        });
    }

    private function seedProductos($getInsumo): void
    {
        // Producto 1: FRESAS CON CREMA
        $producto1 = Producto::updateOrCreate(
            ['nombre' => 'FRESAS CON CREMA'],
            ['precio_venta_publico' => 14000]
        );
        $producto1->insumos()->detach();
        $producto1->agregarInsumo($getInsumo('FRESA'), 200);
        $producto1->agregarInsumo($getInsumo('CREMA DE LA CASA'), 46);
        $producto1->agregarInsumo($getInsumo('CHANTILLY'), 80);
        $producto1->agregarInsumo($getInsumo('MORA'), 7);
        $producto1->agregarInsumo($getInsumo('CEREZA'), 3);
        $producto1->agregarInsumo($getInsumo('HELADO'), 75);
        $producto1->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 2: BANANA SPLIT
        $producto2 = Producto::updateOrCreate(
            ['nombre' => 'BANANA SPLIT'],
            ['precio_venta_publico' => 12500]
        );
        $producto2->insumos()->detach();
        $producto2->agregarInsumo($getInsumo('BANANO'), 1);
        $producto2->agregarInsumo($getInsumo('HELADO'), 210);
        $producto2->agregarInsumo($getInsumo('FRESA'), 20);
        $producto2->agregarInsumo($getInsumo('DURAZNO EN ALMIBAR'), 14);
        $producto2->agregarInsumo($getInsumo('CEREZA'), 3);
        $producto2->agregarInsumo($getInsumo('MANZANA'), 12);
        $producto2->agregarInsumo($getInsumo('CHANTILLY'), 26);
        $producto2->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 8);
        $producto2->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 3: WAFFLE
        $producto3 = Producto::updateOrCreate(
            ['nombre' => 'WAFFLE'],
            ['precio_venta_publico' => 15000]
        );
        $producto3->insumos()->detach();
        $producto3->agregarInsumo($getInsumo('WAFFLE'), 1);
        $producto3->agregarInsumo($getInsumo('AREQUIPE'), 15);
        $producto3->agregarInsumo($getInsumo('DURAZNO EN ALMIBAR'), 34);
        $producto3->agregarInsumo($getInsumo('BANANO'), 0.8);
        $producto3->agregarInsumo($getInsumo('KIWI'), 14);
        $producto3->agregarInsumo($getInsumo('CHANTILLY'), 30);
        $producto3->agregarInsumo($getInsumo('FRESA'), 40);
        $producto3->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 10);
        $producto3->agregarInsumo($getInsumo('HELADO'), 102);

        // Producto 4: CHOLADO
        $producto4 = Producto::updateOrCreate(
            ['nombre' => 'CHOLADO'],
            ['precio_venta_publico' => 13000]
        );
        $producto4->insumos()->detach();
        $producto4->agregarInsumo($getInsumo('MANGO'), 46);
        $producto4->agregarInsumo($getInsumo('FRESA'), 44);
        $producto4->agregarInsumo($getInsumo('PIÑA'), 60);
        $producto4->agregarInsumo($getInsumo('MARACUYA'), 30);
        $producto4->agregarInsumo($getInsumo('BANANO'), 0.3);
        $producto4->agregarInsumo($getInsumo('GUANABANA'), 52);
        $producto4->agregarInsumo($getInsumo('MILO'), 13);
        $producto4->agregarInsumo($getInsumo('MANZANA'), 10);
        $producto4->agregarInsumo($getInsumo('LECHE CONDENSADA'), 40);
        $producto4->agregarInsumo($getInsumo('ESENCIA DE KOLA'), 10);
        $producto4->agregarInsumo($getInsumo('HELADO'), 75);
        $producto4->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 5: BROWNIE CON HELADO
        $producto5 = Producto::updateOrCreate(
            ['nombre' => 'BROWNIE CON HELADO'],
            ['precio_venta_publico' => 10000]
        );
        $producto5->insumos()->detach();
        $producto5->agregarInsumo($getInsumo('BROWNIE'), 1);
        $producto5->agregarInsumo($getInsumo('FRESA'), 20);
        $producto5->agregarInsumo($getInsumo('CHANTILLY'), 28);
        $producto5->agregarInsumo($getInsumo('HELADO'), 70);
        $producto5->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 20);
        $producto5->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 6: COPA BROWNIE
        $producto6 = Producto::updateOrCreate(
            ['nombre' => 'COPA BROWNIE'],
            ['precio_venta_publico' => 12000]
        );
        $producto6->insumos()->detach();
        $producto6->agregarInsumo($getInsumo('BROWNIE'), 1);
        $producto6->agregarInsumo($getInsumo('CHANTILLY'), 62);
        $producto6->agregarInsumo($getInsumo('BARQUILLOS'), 1);
        $producto6->agregarInsumo($getInsumo('HELADO'), 120);
        $producto6->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 8);
        $producto6->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 7: PARFAIT
        $producto7 = Producto::updateOrCreate(
            ['nombre' => 'PARFAIT'],
            ['precio_venta_publico' => 10000]
        );
        $producto7->insumos()->detach();
        $producto7->agregarInsumo($getInsumo('YOGURT'), 108);
        $producto7->agregarInsumo($getInsumo('GRANOLA'), 24);
        $producto7->agregarInsumo($getInsumo('MANGO'), 30);
        $producto7->agregarInsumo($getInsumo('FRESA'), 35);
        $producto7->agregarInsumo($getInsumo('CHANTILLY'), 23);
        $producto7->agregarInsumo($getInsumo('BANANO'), 0.3);
        $producto7->agregarInsumo($getInsumo('MANZANA'), 13);
        $producto7->agregarInsumo($getInsumo('MORA'), 3);
        $producto7->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 8: MARACUMANGO
        $producto8 = Producto::updateOrCreate(
            ['nombre' => 'MARACUMANGO'],
            ['precio_venta_publico' => 10000]
        );
        $producto8->insumos()->detach();
        $producto8->agregarInsumo($getInsumo('MORA'), 6);
        $producto8->agregarInsumo($getInsumo('MARACUYA'), 120);
        $producto8->agregarInsumo($getInsumo('LECHE CONDENSADA'), 15);
        $producto8->agregarInsumo($getInsumo('MANGO'), 84);
        $producto8->agregarInsumo($getInsumo('CHANTILLY'), 32);
        $producto8->agregarInsumo($getInsumo('HELADO'), 63);
        $producto8->agregarInsumo($getInsumo('BARQUILLOS'), 1);
        $producto8->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 9: ENSALADA DE FRUTAS
        $producto9 = Producto::updateOrCreate(
            ['nombre' => 'ENSALADA DE FRUTAS'],
            ['precio_venta_publico' => 18000]
        );
        $producto9->insumos()->detach();
        $producto9->agregarInsumo($getInsumo('PAPAYA'), 113);
        $producto9->agregarInsumo($getInsumo('PATILLA'), 76);
        $producto9->agregarInsumo($getInsumo('MELON'), 50);
        $producto9->agregarInsumo($getInsumo('MANGO'), 60);
        $producto9->agregarInsumo($getInsumo('PIÑA'), 72);
        $producto9->agregarInsumo($getInsumo('BANANO'), 0.5);
        $producto9->agregarInsumo($getInsumo('CREMA DE LA CASA'), 108);
        $producto9->agregarInsumo($getInsumo('QUESO'), 80);
        $producto9->agregarInsumo($getInsumo('GRANOLA'), 15);
        $producto9->agregarInsumo($getInsumo('FRESA'), 36);
        $producto9->agregarInsumo($getInsumo('MANZANA'), 10);
        $producto9->agregarInsumo($getInsumo('HELADO'), 120);
        $producto9->agregarInsumo($getInsumo('SALSA DE MORA'), 12);
        $producto9->agregarInsumo($getInsumo('DURAZNO EN ALMIBAR'), 20);
        $producto9->agregarInsumo($getInsumo('CHANTILLY'), 26);
        $producto9->agregarInsumo($getInsumo('KIWI'), 16);
        $producto9->agregarInsumo($getInsumo('CEREZA'), 6);
        $producto9->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 10: ENSALADA PEQUEÑA
        $producto10 = Producto::updateOrCreate(
            ['nombre' => 'ENSALADA PEQUEÑA'],
            ['precio_venta_publico' => 12000]
        );
        $producto10->insumos()->detach();
        $producto10->agregarInsumo($getInsumo('PAPAYA'), 73);
        $producto10->agregarInsumo($getInsumo('PATILLA'), 59);
        $producto10->agregarInsumo($getInsumo('MELON'), 31);
        $producto10->agregarInsumo($getInsumo('MANGO'), 51);
        $producto10->agregarInsumo($getInsumo('PIÑA'), 50);
        $producto10->agregarInsumo($getInsumo('BANANO'), 0.5);
        $producto10->agregarInsumo($getInsumo('CREMA DE LA CASA'), 68);
        $producto10->agregarInsumo($getInsumo('QUESO'), 33);
        $producto10->agregarInsumo($getInsumo('GRANOLA'), 10);
        $producto10->agregarInsumo($getInsumo('FRESA'), 19);
        $producto10->agregarInsumo($getInsumo('MANZANA'), 6);
        $producto10->agregarInsumo($getInsumo('HELADO'), 60);
        $producto10->agregarInsumo($getInsumo('SALSA DE MORA'), 8);
        $producto10->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 11: MALTEADA PEQUEÑA
        $producto11 = Producto::updateOrCreate(
            ['nombre' => 'MALTEADA PEQUEÑA'],
            ['precio_venta_publico' => 9000]
        );
        $producto11->insumos()->detach();
        $producto11->agregarInsumo($getInsumo('HELADO'), 160);
        $producto11->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 10);
        $producto11->agregarInsumo($getInsumo('CREMA DE LECHE'), 10);
        $producto11->agregarInsumo($getInsumo('LECHE LIQUIDA'), 10);
        $producto11->agregarInsumo($getInsumo('CHANTILLY'), 30);
        $producto11->agregarInsumo($getInsumo('BARQUILLOS'), 1);
        $producto11->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 12: MALTEADA GRANDE
        $producto12 = Producto::updateOrCreate(
            ['nombre' => 'MALTEADA GRANDE'],
            ['precio_venta_publico' => 12500]
        );
        $producto12->insumos()->detach();
        $producto12->agregarInsumo($getInsumo('HELADO'), 250);
        $producto12->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 10);
        $producto12->agregarInsumo($getInsumo('CREMA DE LECHE'), 10);
        $producto12->agregarInsumo($getInsumo('LECHE LIQUIDA'), 10);
        $producto12->agregarInsumo($getInsumo('CHANTILLY'), 55);
        $producto12->agregarInsumo($getInsumo('BARQUILLOS'), 1);
        $producto12->agregarInsumo($getInsumo('CEREZA'), 3);
        $producto12->agregarInsumo($getInsumo('LLUVIA DE CHOCOLATE'), 5);
        $producto12->agregarInsumo($getInsumo('SERVILLETAS'), 1);

        // Producto 13: COPA WHISKY
        $producto13 = Producto::updateOrCreate(
            ['nombre' => 'COPA WHISKY'],
            ['precio_venta_publico' => 14000]
        );
        $producto13->insumos()->detach();
        $producto13->agregarInsumo($getInsumo('HELADO'), 116);
        $producto13->agregarInsumo($getInsumo('CREMA DE WHISKY'), 57);
        $producto13->agregarInsumo($getInsumo('CREMA DE LECHE'), 10);
        $producto13->agregarInsumo($getInsumo('CHANTILLY'), 59);
        $producto13->agregarInsumo($getInsumo('BROWNIE'), 1);
        $producto13->agregarInsumo($getInsumo('SERVILLETAS'), 1);

        // Producto 14: GELATINA
        $producto14 = Producto::updateOrCreate(
            ['nombre' => 'GELATINA'],
            ['precio_venta_publico' => 12000]
        );
        $producto14->insumos()->detach();
        $producto14->agregarInsumo($getInsumo('GELATINA'), 66);
        $producto14->agregarInsumo($getInsumo('CREMA DE LA CASA'), 12);
        $producto14->agregarInsumo($getInsumo('QUESO'), 15);
        $producto14->agregarInsumo($getInsumo('BARQUILLOS'), 1);
        $producto14->agregarInsumo($getInsumo('CHANTILLY'), 13);
        $producto14->agregarInsumo($getInsumo('HELADO'), 120);
        $producto14->agregarInsumo($getInsumo('SALSA DE MORA'), 5);
        $producto14->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 15: DURAZNO EN ALMIBAR
        $producto15 = Producto::updateOrCreate(
            ['nombre' => 'DURAZNO EN ALMIBAR'],
            ['precio_venta_publico' => 12000]
        );
        $producto15->insumos()->detach();
        $producto15->agregarInsumo($getInsumo('DURAZNO EN ALMIBAR'), 60);
        $producto15->agregarInsumo($getInsumo('HELADO'), 130);
        $producto15->agregarInsumo($getInsumo('CHANTILLY'), 70);
        $producto15->agregarInsumo($getInsumo('AREQUIPE'), 6);
        $producto15->agregarInsumo($getInsumo('LLUVIA DE CHOCOLATE'), 1);
        $producto15->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 16: OBLEAS
        $producto16 = Producto::updateOrCreate(
            ['nombre' => 'OBLEAS'],
            ['precio_venta_publico' => 8000]
        );
        $producto16->insumos()->detach();
        $producto16->agregarInsumo($getInsumo('AREQUIPE'), 73);
        $producto16->agregarInsumo($getInsumo('QUESO'), 20);
        $producto16->agregarInsumo($getInsumo('MORA'), 30);
        $producto16->agregarInsumo($getInsumo('CHANTILLY'), 40);
        $producto16->agregarInsumo($getInsumo('FRESA'), 69);
        $producto16->agregarInsumo($getInsumo('OBLEA'), 2);
        $producto16->agregarInsumo($getInsumo('SERVILLETAS'), 1);

        // Producto 17: PAYASO
        $producto17 = Producto::updateOrCreate(
            ['nombre' => 'PAYASO'],
            ['precio_venta_publico' => 7500]
        );
        $producto17->insumos()->detach();
        $producto17->agregarInsumo($getInsumo('CONO DE GALLETA'), 1);
        $producto17->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 3);
        $producto17->agregarInsumo($getInsumo('SALSA DE MORA'), 3);
        $producto17->agregarInsumo($getInsumo('GRAJEAS'), 1);
        $producto17->agregarInsumo($getInsumo('HELADO'), 105);
        $producto17->agregarInsumo($getInsumo('CHANTILLY'), 34);
        $producto17->agregarInsumo($getInsumo('OJOS Y NARIZ'), 1);
        $producto17->agregarInsumo($getInsumo('SERVILLETAS'), 1);

        // Producto 18: OSO
        $producto18 = Producto::updateOrCreate(
            ['nombre' => 'OSO'],
            ['precio_venta_publico' => 8500]
        );
        $producto18->insumos()->detach();
        $producto18->agregarInsumo($getInsumo('GALLETA MINI CHIPS'), 7);
        $producto18->agregarInsumo($getInsumo('HELADO'), 120);
        $producto18->agregarInsumo($getInsumo('CANASTA DE GALLETA'), 1);
        $producto18->agregarInsumo($getInsumo('CHANTILLY'), 20);
        $producto18->agregarInsumo($getInsumo('MASMELOS'), 2);
        $producto18->agregarInsumo($getInsumo('OJOS Y NARIZ'), 1);
        $producto18->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 19: RATON
        $producto19 = Producto::updateOrCreate(
            ['nombre' => 'RATON'],
            ['precio_venta_publico' => 8500]
        );
        $producto19->insumos()->detach();
        $producto19->agregarInsumo($getInsumo('CANASTA DE GALLETA'), 1);
        $producto19->agregarInsumo($getInsumo('GALLETA OREO'), 1);
        $producto19->agregarInsumo($getInsumo('CHANTILLY'), 20);
        $producto19->agregarInsumo($getInsumo('HELADO'), 120);
        $producto19->agregarInsumo($getInsumo('GOMAS GUSANITO'), 1);
        $producto19->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 20: ARAÑA
        $producto20 = Producto::updateOrCreate(
            ['nombre' => 'ARAÑA'],
            ['precio_venta_publico' => 8500]
        );
        $producto20->insumos()->detach();
        $producto20->agregarInsumo($getInsumo('CANASTA DE GALLETA'), 1);
        $producto20->agregarInsumo($getInsumo('HELADO'), 120);
        $producto20->agregarInsumo($getInsumo('CHANTILLY'), 20);
        $producto20->agregarInsumo($getInsumo('OJOS Y NARIZ'), 1);
        $producto20->agregarInsumo($getInsumo('GOMAS GUSANITO'), 4);
        $producto20->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 21: FRAPPE DE MILO
        $producto21 = Producto::updateOrCreate(
            ['nombre' => 'FRAPPE DE MILO'],
            ['precio_venta_publico' => 12000]
        );
        $producto21->insumos()->detach();
        $producto21->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 10);
        $producto21->agregarInsumo($getInsumo('MEZCLA DE FRAPPE'), 70);
        $producto21->agregarInsumo($getInsumo('HELADO'), 100);
        $producto21->agregarInsumo($getInsumo('CHANTILLY'), 55);
        $producto21->agregarInsumo($getInsumo('LECHE LIQUIDA'), 10);
        $producto21->agregarInsumo($getInsumo('BARQUILLOS'), 1);
        $producto21->agregarInsumo($getInsumo('HIELO'), 150);
        $producto21->agregarInsumo($getInsumo('CHIPS DE CHOCOLATE'), 5);
        $producto21->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 22: FRAPPE OREO
        $producto22 = Producto::updateOrCreate(
            ['nombre' => 'FRAPPE OREO'],
            ['precio_venta_publico' => 12000]
        );
        $producto22->insumos()->detach();
        $producto22->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 10);
        $producto22->agregarInsumo($getInsumo('MEZCLA DE FRAPPE'), 50);
        $producto22->agregarInsumo($getInsumo('HELADO'), 100);
        $producto22->agregarInsumo($getInsumo('CHANTILLY'), 55);
        $producto22->agregarInsumo($getInsumo('LECHE LIQUIDA'), 10);
        $producto22->agregarInsumo($getInsumo('BARQUILLOS'), 1);
        $producto22->agregarInsumo($getInsumo('HIELO'), 150);
        $producto22->agregarInsumo($getInsumo('CHIPS DE CHOCOLATE'), 5);
        $producto22->agregarInsumo($getInsumo('GALLETA OREO'), 3);
        $producto22->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 23: FRAPPE CAFÉ
        $producto23 = Producto::updateOrCreate(
            ['nombre' => 'FRAPPE CAFÉ'],
            ['precio_venta_publico' => 12000]
        );
        $producto23->insumos()->detach();
        $producto23->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 10);
        $producto23->agregarInsumo($getInsumo('MEZCLA DE FRAPPE'), 70);
        $producto23->agregarInsumo($getInsumo('HELADO'), 100);
        $producto23->agregarInsumo($getInsumo('CHANTILLY'), 55);
        $producto23->agregarInsumo($getInsumo('LECHE LIQUIDA'), 10);
        $producto23->agregarInsumo($getInsumo('BARQUILLOS'), 1);
        $producto23->agregarInsumo($getInsumo('HIELO'), 150);
        $producto23->agregarInsumo($getInsumo('CHIPS DE CHOCOLATE'), 5);
        $producto23->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 24: GUSANITO
        $producto24 = Producto::updateOrCreate(
            ['nombre' => 'GUSANITO'],
            ['precio_venta_publico' => 9500]
        );
        $producto24->insumos()->detach();
        $producto24->agregarInsumo($getInsumo('HELADO'), 180);
        $producto24->agregarInsumo($getInsumo('GOMAS GUSANITO'), 5);
        $producto24->agregarInsumo($getInsumo('LECHE CONDENSADA'), 5);
        $producto24->agregarInsumo($getInsumo('GRAJEAS'), 5);
        $producto24->agregarInsumo($getInsumo('OJOS Y NARIZ'), 1);
        $producto24->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 25: CREPE
        $producto25 = Producto::updateOrCreate(
            ['nombre' => 'CREPE'],
            ['precio_venta_publico' => 15000]
        );
        $producto25->insumos()->detach();
        $producto25->agregarInsumo($getInsumo('NUTELLA'), 26);
        $producto25->agregarInsumo($getInsumo('BANANO'), 1);
        $producto25->agregarInsumo($getInsumo('FRESA'), 78);
        $producto25->agregarInsumo($getInsumo('CHANTILLY'), 39);
        $producto25->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 20);
        $producto25->agregarInsumo($getInsumo('HELADO'), 104);
        $producto25->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 26: MALTEADA WAFFLE
        $producto26 = Producto::updateOrCreate(
            ['nombre' => 'MALTEADA WAFFLE'],
            ['precio_venta_publico' => 17000]
        );
        $producto26->insumos()->detach();
        $producto26->agregarInsumo($getInsumo('HELADO'), 240);
        $producto26->agregarInsumo($getInsumo('FRESA'), 70);
        $producto26->agregarInsumo($getInsumo('AREQUIPE'), 10);
        $producto26->agregarInsumo($getInsumo('MANI TRITURADO'), 22);
        $producto26->agregarInsumo($getInsumo('LECHE LIQUIDA'), 10);
        $producto26->agregarInsumo($getInsumo('CREMA DE LECHE'), 10);
        $producto26->agregarInsumo($getInsumo('CHANTILLY'), 58);
        $producto26->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 16);
        $producto26->agregarInsumo($getInsumo('WAFFLE'), 0.3);

        // Producto 27: CREPE FUSION TROPICAL
        $producto27 = Producto::updateOrCreate(
            ['nombre' => 'CREPE FUSION TROPICAL'],
            ['precio_venta_publico' => 15000]
        );
        $producto27->insumos()->detach();
        $producto27->agregarInsumo($getInsumo('CREPE'), 1);
        $producto27->agregarInsumo($getInsumo('HELADO'), 70);
        $producto27->agregarInsumo($getInsumo('BANANO'), 1);
        $producto27->agregarInsumo($getInsumo('DURAZNO EN ALMIBAR'), 30);
        $producto27->agregarInsumo($getInsumo('MARACUYA'), 30);
        $producto27->agregarInsumo($getInsumo('PIÑA'), 40);
        $producto27->agregarInsumo($getInsumo('AREQUIPE'), 20);
        $producto27->agregarInsumo($getInsumo('CHANTILLY'), 40);
        $producto27->agregarInsumo($getInsumo('CUCHILLO'), 1);
        $producto27->agregarInsumo($getInsumo('TENEDOR'), 1);
        $producto27->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 28: LIMONADA DE COCO 18ONZ
        $producto28 = Producto::updateOrCreate(
            ['nombre' => 'LIMONADA DE COCO 18ONZ'],
            ['precio_venta_publico' => 9000]
        );
        $producto28->insumos()->detach();
        $producto28->agregarInsumo($getInsumo('CREMA DE COCO'), 125);
        $producto28->agregarInsumo($getInsumo('LECHE LIQUIDA'), 120);
        $producto28->agregarInsumo($getInsumo('LIMON'), 30);
        $producto28->agregarInsumo($getInsumo('AZUCAR'), 50);
        $producto28->agregarInsumo($getInsumo('HIELO'), 30);
        $producto28->agregarInsumo($getInsumo('CEREZA'), 4);

        // Producto 29: CREPE CHOCO
        $producto29 = Producto::updateOrCreate(
            ['nombre' => 'CREPE CHOCO'],
            ['precio_venta_publico' => 15000]
        );
        $producto29->insumos()->detach();
        $producto29->agregarInsumo($getInsumo('HELADO'), 102);
        $producto29->agregarInsumo($getInsumo('FRESA'), 110);
        $producto29->agregarInsumo($getInsumo('CHOCO CUBIERTA'), 35);
        $producto29->agregarInsumo($getInsumo('ACEITE'), 10);
        $producto29->agregarInsumo($getInsumo('CREMA DE LA CASA'), 35);
        $producto29->agregarInsumo($getInsumo('CREPE'), 1);
        $producto29->agregarInsumo($getInsumo('LECHE LIQUIDA'), 45);
        $producto29->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 10);
        $producto29->agregarInsumo($getInsumo('CHANTILLY'), 40);
        $producto29->agregarInsumo($getInsumo('TENEDOR'), 1);
        $producto29->agregarInsumo($getInsumo('CUCHILLO'), 1);
        $producto29->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 30: WAFFLE PAN DE YUCA
        $producto30 = Producto::updateOrCreate(
            ['nombre' => 'WAFFLE PAN DE YUCA'],
            ['precio_venta_publico' => 12000]
        );
        $producto30->insumos()->detach();
        $producto30->agregarInsumo($getInsumo('MEZCLA DE YUCA'), 70);
        $producto30->agregarInsumo($getInsumo('LECHE LIQUIDA'), 80);
        $producto30->agregarInsumo($getInsumo('QUESO SALADO'), 30);
        $producto30->agregarInsumo($getInsumo('HUEVO'), 0.5);
        $producto30->agregarInsumo($getInsumo('QUESO DOBLE CREMA'), 50);
        $producto30->agregarInsumo($getInsumo('AREQUIPE'), 30);
        $producto30->agregarInsumo($getInsumo('HELADO'), 102);
        $producto30->agregarInsumo($getInsumo('CUCHILLO'), 1);
        $producto30->agregarInsumo($getInsumo('TENEDOR'), 1);
        $producto30->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 31: BUHO
        $producto31 = Producto::updateOrCreate(
            ['nombre' => 'BUHO'],
            ['precio_venta_publico' => 8500]
        );
        $producto31->insumos()->detach();
        $producto31->agregarInsumo($getInsumo('HELADO'), 150);
        $producto31->agregarInsumo($getInsumo('GALLETA OREO'), 2);
        $producto31->agregarInsumo($getInsumo('GRAJEAS'), 10);
        $producto31->agregarInsumo($getInsumo('CHANTILLY'), 40);
        $producto31->agregarInsumo($getInsumo('MYM GRANDE'), 1);
        $producto31->agregarInsumo($getInsumo('CHIPS DE CHOCOLATE'), 2);
        $producto31->agregarInsumo($getInsumo('CUCHARA'), 1);
        $producto31->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 32: POLLO
        $producto32 = Producto::updateOrCreate(
            ['nombre' => 'POLLO'],
            ['precio_venta_publico' => 8500]
        );
        $producto32->insumos()->detach();
        $producto32->agregarInsumo($getInsumo('HELADO'), 150);
        $producto32->agregarInsumo($getInsumo('CHANTILLY'), 25);
        $producto32->agregarInsumo($getInsumo('FRESA'), 27);
        $producto32->agregarInsumo($getInsumo('GRAJEAS'), 10);
        $producto32->agregarInsumo($getInsumo('MYM GRANDE'), 1);
        $producto32->agregarInsumo($getInsumo('CHIPS DE CHOCOLATE'), 2);
        $producto32->agregarInsumo($getInsumo('CUCHARA'), 1);
        $producto32->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 33: GATO
        $producto33 = Producto::updateOrCreate(
            ['nombre' => 'GATO'],
            ['precio_venta_publico' => 8500]
        );
        $producto33->insumos()->detach();
        $producto33->agregarInsumo($getInsumo('HELADO'), 150);
        $producto33->agregarInsumo($getInsumo('MASMELOS'), 2);
        $producto33->agregarInsumo($getInsumo('CHANTILLY'), 25);
        $producto33->agregarInsumo($getInsumo('GRAJEAS'), 20);
        $producto33->agregarInsumo($getInsumo('CHIPS DE CHOCOLATE'), 2);
        $producto33->agregarInsumo($getInsumo('MINI GOMA'), 1);
        $producto33->agregarInsumo($getInsumo('CUCHARA'), 1);
        $producto33->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 34: MARIPOSA
        $producto34 = Producto::updateOrCreate(
            ['nombre' => 'MARIPOSA'],
            ['precio_venta_publico' => 8500]
        );
        $producto34->insumos()->detach();
        $producto34->agregarInsumo($getInsumo('HELADO'), 150);
        $producto34->agregarInsumo($getInsumo('FRESA'), 30);
        $producto34->agregarInsumo($getInsumo('BANANO'), 0.5);
        $producto34->agregarInsumo($getInsumo('MEZCLA WAFFLE'), 35);
        $producto34->agregarInsumo($getInsumo('LECHE LIQUIDA'), 48);
        $producto34->agregarInsumo($getInsumo('CHIPS DE CHOCOLATE'), 2);
        $producto34->agregarInsumo($getInsumo('SALSA DE CHOCOLATE'), 15);
        $producto34->agregarInsumo($getInsumo('CUCHARA'), 1);
        $producto34->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 35: SODA SANDIA
        $producto35 = Producto::updateOrCreate(
            ['nombre' => 'SODA SANDIA'],
            ['precio_venta_publico' => 12000]
        );
        $producto35->insumos()->detach();
        $producto35->agregarInsumo($getInsumo('SODA'), 1);
        $producto35->agregarInsumo($getInsumo('AZUCAR'), 30);
        $producto35->agregarInsumo($getInsumo('PATILLA'), 80);
        $producto35->agregarInsumo($getInsumo('LIMON'), 90);
        $producto35->agregarInsumo($getInsumo('GRANADINA'), 45);
        $producto35->agregarInsumo($getInsumo('BUBOLS'), 35);
        $producto35->agregarInsumo($getInsumo('PITILLOS'), 1);
        $producto35->agregarInsumo($getInsumo('CUCHARA'), 1);
        $producto35->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 36: SODA MARACUYA
        $producto36 = Producto::updateOrCreate(
            ['nombre' => 'SODA MARACUYA'],
            ['precio_venta_publico' => 12000]
        );
        $producto36->insumos()->detach();
        $producto36->agregarInsumo($getInsumo('SODA'), 1);
        $producto36->agregarInsumo($getInsumo('LIMON'), 90);
        $producto36->agregarInsumo($getInsumo('MARACUYA'), 40);
        $producto36->agregarInsumo($getInsumo('AZUCAR'), 40);
        $producto36->agregarInsumo($getInsumo('BUBOLS'), 35);
        $producto36->agregarInsumo($getInsumo('MANZANA'), 25);
        $producto36->agregarInsumo($getInsumo('PITILLOS'), 1);
        $producto36->agregarInsumo($getInsumo('CUCHARA'), 1);
        $producto36->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 37: MICHELADA DE MARACUYA
        $producto37 = Producto::updateOrCreate(
            ['nombre' => 'MICHELADA DE MARACUYA'],
            ['precio_venta_publico' => 10000]
        );
        $producto37->insumos()->detach();
        $producto37->agregarInsumo($getInsumo('CORONITA'), 1);
        $producto37->agregarInsumo($getInsumo('CEREZA'), 1);
        $producto37->agregarInsumo($getInsumo('GOMAS DE AROS'), 2);
        $producto37->agregarInsumo($getInsumo('MARACUYA'), 40);
        $producto37->agregarInsumo($getInsumo('LIMON'), 90);
        $producto37->agregarInsumo($getInsumo('SAL DE COLOR'), 5);
        $producto37->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 38: MICHELADA DE MANGO
        $producto38 = Producto::updateOrCreate(
            ['nombre' => 'MICHELADA DE MANGO'],
            ['precio_venta_publico' => 10000]
        );
        $producto38->insumos()->detach();
        $producto38->agregarInsumo($getInsumo('CORONITA'), 1);
        $producto38->agregarInsumo($getInsumo('LIMON'), 90);
        $producto38->agregarInsumo($getInsumo('MANGO'), 60);
        $producto38->agregarInsumo($getInsumo('CEREZA'), 1);
        $producto38->agregarInsumo($getInsumo('SERVILLETAS'), 2);

        // Producto 39: MICHELADA
        $producto39 = Producto::updateOrCreate(
            ['nombre' => 'MICHELADA'],
            ['precio_venta_publico' => 12000]
        );
        $producto39->insumos()->detach();
        $producto39->agregarInsumo($getInsumo('CORONITA'), 1);
        $producto39->agregarInsumo($getInsumo('LIMON'), 90);
        $producto39->agregarInsumo($getInsumo('GRANADINA'), 45);
        $producto39->agregarInsumo($getInsumo('CEREZA'), 1);
        $producto39->agregarInsumo($getInsumo('SERVILLETAS'), 2);
    }
}
