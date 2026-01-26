<?php

namespace Database\Seeders;

use App\Models\Insumo;
use Illuminate\Database\Seeder;

class InsumoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $insumos = [
            ['nombre' => 'FRESA', 'precio' => 8000, 'unidad' => 'LIBRA', 'presentacion' => 500],
            ['nombre' => 'CREMA DE LA CASA', 'precio' => 11, 'unidad' => 'UNIDAD', 'presentacion' => 1],
            ['nombre' => 'CHANTILLY', 'precio' => 54000, 'unidad' => 'KILO', 'presentacion' => 3000],
            ['nombre' => 'MORA', 'precio' => 2500, 'unidad' => 'LIBRA', 'presentacion' => 500],
            ['nombre' => 'CEREZA', 'precio' => 87000, 'unidad' => 'LIBRA', 'presentacion' => 2400],
            ['nombre' => 'HELADO', 'precio' => 74400, 'unidad' => 'KILO', 'presentacion' => 5000],
            ['nombre' => 'SERVILLETAS', 'precio' => 11000, 'unidad' => 'UNIDAD', 'presentacion' => 550],
            ['nombre' => 'BANANO', 'precio' => 500, 'unidad' => 'LIBRA', 'presentacion' => 1],
            ['nombre' => 'DURAZNO EN ALMIBAR', 'precio' => 10000, 'unidad' => 'KILO', 'presentacion' => 480],
            ['nombre' => 'MANZANA', 'precio' => 1800, 'unidad' => 'LIBRA', 'presentacion' => 103],
            ['nombre' => 'SALSA DE CHOCOLATE', 'precio' => 9000, 'unidad' => 'KILO', 'presentacion' => 1000],
            ['nombre' => 'WAFFLE', 'precio' => 1600, 'unidad' => 'UNIDAD', 'presentacion' => 1],
            ['nombre' => 'AREQUIPE', 'precio' => 60000, 'unidad' => 'KILO', 'presentacion' => 5000],
            ['nombre' => 'KIWI', 'precio' => 10000, 'unidad' => 'LIBRA', 'presentacion' => 500],
            ['nombre' => 'MANGO', 'precio' => 4200, 'unidad' => 'LIBRA', 'presentacion' => 375],
            ['nombre' => 'PIÑA', 'precio' => 2600, 'unidad' => 'LIBRA', 'presentacion' => 300],
            ['nombre' => 'MARACUYA', 'precio' => 5000, 'unidad' => 'LIBRA', 'presentacion' => 500],
            ['nombre' => 'GUANABANA', 'precio' => 3200, 'unidad' => 'LIBRA', 'presentacion' => 280],
            ['nombre' => 'MILO', 'precio' => 18000, 'unidad' => 'KILO', 'presentacion' => 500],
            ['nombre' => 'LECHE CONDENSADA', 'precio' => 56000, 'unidad' => 'KILO', 'presentacion' => 5000],
            ['nombre' => 'ESENCIA DE KOLA', 'precio' => 2500, 'unidad' => 'LITRO', 'presentacion' => 470],
            ['nombre' => 'BROWNIE', 'precio' => 2050, 'unidad' => 'UNIDAD', 'presentacion' => 1],
            ['nombre' => 'BARQUILLOS', 'precio' => 220, 'unidad' => 'UNIDAD', 'presentacion' => 1],
            ['nombre' => 'YOGURT', 'precio' => 9000, 'unidad' => 'LITRO', 'presentacion' => 900],
            ['nombre' => 'GRANOLA', 'precio' => 12000, 'unidad' => 'KILO', 'presentacion' => 1000],
            ['nombre' => 'PAPAYA', 'precio' => 100, 'unidad' => 'LIBRA', 'presentacion' => 400],
            ['nombre' => 'PATILLA', 'precio' => 1200, 'unidad' => 'LIBRA', 'presentacion' => 290],
            ['nombre' => 'MELON', 'precio' => 2100, 'unidad' => 'LIBRA', 'presentacion' => 280],
            ['nombre' => 'QUESO', 'precio' => 7500, 'unidad' => 'KILO', 'presentacion' => 500],
            ['nombre' => 'QUESO SALADO', 'precio' => 14500, 'unidad' => 'KILO', 'presentacion' => 500],
            ['nombre' => 'QUESO DOBLE CREMA', 'precio' => 22, 'unidad' => 'KILO', 'presentacion' => 1],
            ['nombre' => 'SALSA DE MORA', 'precio' => 15000, 'unidad' => 'KILO', 'presentacion' => 1000],
            ['nombre' => 'HUEVO', 'precio' => 416, 'unidad' => 'UNIDAD', 'presentacion' => 1],
            ['nombre' => 'CREMA DE LECHE', 'precio' => 20400, 'unidad' => 'LITRO', 'presentacion' => 1800],
            ['nombre' => 'LECHE LIQUIDA', 'precio' => 4500, 'unidad' => 'LITRO', 'presentacion' => 1100],
            ['nombre' => 'CREMA DE WHISKY', 'precio' => 10000, 'unidad' => 'LITRO', 'presentacion' => 700],
            ['nombre' => 'LLUVIA DE CHOCOLATE', 'precio' => 15600, 'unidad' => 'KILO', 'presentacion' => 500],
            ['nombre' => 'CONO DE GALLETA', 'precio' => 145000, 'unidad' => 'UNIDAD', 'presentacion' => 500],
            ['nombre' => 'GRAJEAS', 'precio' => 500, 'unidad' => 'GRAMO', 'presentacion' => 500],
            ['nombre' => 'GELATINA', 'precio' => 4050, 'unidad' => 'KILO', 'presentacion' => 205],
            ['nombre' => 'OBLEA', 'precio' => 10500, 'unidad' => 'UNIDAD', 'presentacion' => 50],
            ['nombre' => 'GALLETA MINI CHIPS', 'precio' => 12000, 'unidad' => 'KILO', 'presentacion' => 420],
            ['nombre' => 'CANASTA DE GALLETA', 'precio' => 116000, 'unidad' => 'UNIDAD', 'presentacion' => 200],
            ['nombre' => 'MASMELOS', 'precio' => 7900, 'unidad' => 'GRAMO', 'presentacion' => 335],
            ['nombre' => 'OJOS Y NARIZ', 'precio' => 100, 'unidad' => 'UNIDAD', 'presentacion' => 1],
            ['nombre' => 'GALLETA OREO', 'precio' => 9000, 'unidad' => 'KILO', 'presentacion' => 48],
            ['nombre' => 'GOMAS GUSANITO', 'precio' => 14000, 'unidad' => 'GRAMO', 'presentacion' => 500],
            ['nombre' => 'MEZCLA DE FRAPPE', 'precio' => 3500, 'unidad' => 'KILO', 'presentacion' => 125],
            ['nombre' => 'HIELO', 'precio' => 2800, 'unidad' => 'KILO', 'presentacion' => 2000],
            ['nombre' => 'CHIPS DE CHOCOLATE', 'precio' => 14000, 'unidad' => 'KILO', 'presentacion' => 500],
            ['nombre' => 'MANI TRITURADO', 'precio' => 8000, 'unidad' => 'KILO', 'presentacion' => 500],
            ['nombre' => 'CREMA DE COCO', 'precio' => 27000, 'unidad' => 'KILO', 'presentacion' => 1000],
            ['nombre' => 'LIMON', 'precio' => 1800, 'unidad' => 'LIBRA', 'presentacion' => 250],
            ['nombre' => 'AZUCAR', 'precio' => 2200, 'unidad' => 'KILO', 'presentacion' => 500],
            ['nombre' => 'MYM GRANDE', 'precio' => 18500, 'unidad' => 'UNIDAD', 'presentacion' => 500],
            ['nombre' => 'CUCHARA', 'precio' => 4200, 'unidad' => 'UNIDAD', 'presentacion' => 100],
            ['nombre' => 'SODA', 'precio' => 2200, 'unidad' => 'LITRO', 'presentacion' => 1],
            ['nombre' => 'BUBOLS', 'precio' => 35000, 'unidad' => 'UNIDAD', 'presentacion' => 880],
            ['nombre' => 'PITILLOS', 'precio' => 6000, 'unidad' => 'UNIDAD', 'presentacion' => 100],
            ['nombre' => 'CORONITA', 'precio' => 2250, 'unidad' => 'UNIDAD', 'presentacion' => 1],
            ['nombre' => 'CUCHILLO', 'precio' => 4300, 'unidad' => 'UNIDAD', 'presentacion' => 100],
            ['nombre' => 'TENEDOR', 'precio' => 4500, 'unidad' => 'UNIDAD', 'presentacion' => 100],
            ['nombre' => 'NUTELLA', 'precio' => 9900, 'unidad' => 'KILO', 'presentacion' => 350],
            ['nombre' => 'CREPE', 'precio' => 800, 'unidad' => 'UNIDAD', 'presentacion' => 1],
            ['nombre' => 'CHOCO CUBIERTA', 'precio' => 34500, 'unidad' => 'KILO', 'presentacion' => 1150],
            ['nombre' => 'ACEITE', 'precio' => 50, 'unidad' => 'LITRO', 'presentacion' => 1],
            ['nombre' => 'GRANADINA', 'precio' => 25600, 'unidad' => 'LITRO', 'presentacion' => 1000],
            ['nombre' => 'GOMAS DE AROS', 'precio' => 100, 'unidad' => 'GRAMO', 'presentacion' => 1],
            ['nombre' => 'SAL DE COLOR', 'precio' => 8000, 'unidad' => 'KILO', 'presentacion' => 500],
            ['nombre' => 'MANO DE OBRA', 'precio' => 139, 'unidad' => 'UNIDAD', 'presentacion' => 1],
            ['nombre' => 'MEZCLA DE YUCA', 'precio' => 0, 'unidad' => 'KILO', 'presentacion' => 1],
            ['nombre' => 'MINI GOMA', 'precio' => 0, 'unidad' => 'GRAMO', 'presentacion' => 1],
            ['nombre' => 'MEZCLA WAFFLE', 'precio' => 0, 'unidad' => 'KILO', 'presentacion' => 1],
        ];

        foreach ($insumos as $insumo) {
            Insumo::updateOrCreate(
                ['nombre' => $insumo['nombre']],
                [
                    'precio' => $insumo['precio'],
                    'unidad' => $insumo['unidad'],
                    'presentacion' => $insumo['presentacion'],
                ]
            );
        }
    }
}
