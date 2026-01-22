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
            ['nombre' => 'FRESA', 'precio' => 8000, 'unidad' => 'LIBRA'],
            ['nombre' => 'CREMA DE LA CASA', 'precio' => 11, 'unidad' => 'UNIDAD'],
            ['nombre' => 'CHANTILLY', 'precio' => 54000, 'unidad' => 'KILO'],
            ['nombre' => 'MORA', 'precio' => 2500, 'unidad' => 'LIBRA'],
            ['nombre' => 'CEREZA', 'precio' => 87000, 'unidad' => 'LIBRA'],
            ['nombre' => 'HELADO', 'precio' => 74400, 'unidad' => 'KILO'],
            ['nombre' => 'SERVILLETAS', 'precio' => 11000, 'unidad' => 'UNIDAD'],
            ['nombre' => 'BANANO', 'precio' => 500, 'unidad' => 'LIBRA'],
            ['nombre' => 'DURAZNO EN ALMIBAR', 'precio' => 10000, 'unidad' => 'KILO'],
            ['nombre' => 'MANZANA', 'precio' => 1800, 'unidad' => 'LIBRA'],
            ['nombre' => 'SALSA DE CHOCOLATE', 'precio' => 9000, 'unidad' => 'KILO'],
            ['nombre' => 'WAFFLE', 'precio' => 1600, 'unidad' => 'UNIDAD'],
            ['nombre' => 'AREQUIPE', 'precio' => 60000, 'unidad' => 'KILO'],
            ['nombre' => 'KIWI', 'precio' => 10000, 'unidad' => 'LIBRA'],
            ['nombre' => 'MANGO', 'precio' => 4200, 'unidad' => 'LIBRA'],
            ['nombre' => 'PIÑA', 'precio' => 2600, 'unidad' => 'LIBRA'],
            ['nombre' => 'MARACUYA', 'precio' => 5000, 'unidad' => 'LIBRA'],
            ['nombre' => 'GUANABANA', 'precio' => 3200, 'unidad' => 'LIBRA'],
            ['nombre' => 'MILO', 'precio' => 18000, 'unidad' => 'KILO'],
            ['nombre' => 'LECHE CONDENSADA', 'precio' => 56000, 'unidad' => 'KILO'],
            ['nombre' => 'ESENCIA DE KOLA', 'precio' => 2500, 'unidad' => 'LITRO'],
            ['nombre' => 'BROWNIE', 'precio' => 2050, 'unidad' => 'UNIDAD'],
            ['nombre' => 'BARQUILLOS', 'precio' => 220, 'unidad' => 'UNIDAD'],
            ['nombre' => 'YOGURT', 'precio' => 9000, 'unidad' => 'LITRO'],
            ['nombre' => 'GRANOLA', 'precio' => 12000, 'unidad' => 'KILO'],
            ['nombre' => 'PAPAYA', 'precio' => 100, 'unidad' => 'LIBRA'],
            ['nombre' => 'PATILLA', 'precio' => 1200, 'unidad' => 'LIBRA'],
            ['nombre' => 'MELON', 'precio' => 2100, 'unidad' => 'LIBRA'],
            ['nombre' => 'QUESO', 'precio' => 7500, 'unidad' => 'KILO'],
            ['nombre' => 'QUESO SALADO', 'precio' => 14500, 'unidad' => 'KILO'],
            ['nombre' => 'QUESO DOBLE CREMA', 'precio' => 22, 'unidad' => 'KILO'],
            ['nombre' => 'SALSA DE MORA', 'precio' => 15000, 'unidad' => 'KILO'],
            ['nombre' => 'HUEVO', 'precio' => 416, 'unidad' => 'UNIDAD'],
            ['nombre' => 'CREMA DE LECHE', 'precio' => 20400, 'unidad' => 'LITRO'],
            ['nombre' => 'LECHE LIQUIDA', 'precio' => 4500, 'unidad' => 'LITRO'],
            ['nombre' => 'CREMA DE WHISKY', 'precio' => 10000, 'unidad' => 'LITRO'],
            ['nombre' => 'LLUVIA DE CHOCOLATE', 'precio' => 15600, 'unidad' => 'KILO'],
            ['nombre' => 'CONO DE GALLETA', 'precio' => 145000, 'unidad' => 'UNIDAD'],
            ['nombre' => 'GRAJEAS', 'precio' => 500, 'unidad' => 'GRAMO'],
            ['nombre' => 'GELATINA', 'precio' => 4050, 'unidad' => 'KILO'],
            ['nombre' => 'OBLEA', 'precio' => 10500, 'unidad' => 'UNIDAD'],
            ['nombre' => 'GALLETA MINI CHIPS', 'precio' => 12000, 'unidad' => 'KILO'],
            ['nombre' => 'CANASTA DE GALLETA', 'precio' => 116000, 'unidad' => 'UNIDAD'],
            ['nombre' => 'MASMELOS', 'precio' => 7900, 'unidad' => 'GRAMO'],
            ['nombre' => 'OJOS Y NARIZ', 'precio' => 100, 'unidad' => 'UNIDAD'],
            ['nombre' => 'GALLETA OREO', 'precio' => 9000, 'unidad' => 'KILO'],
            ['nombre' => 'GOMAS GUSANITO', 'precio' => 14000, 'unidad' => 'GRAMO'],
            ['nombre' => 'MEZCLA DE FRAPPE', 'precio' => 3500, 'unidad' => 'KILO'],
            ['nombre' => 'HIELO', 'precio' => 2800, 'unidad' => 'KILO'],
            ['nombre' => 'CHIPS DE CHOCOLATE', 'precio' => 14000, 'unidad' => 'KILO'],
            ['nombre' => 'MANI TRITURADO', 'precio' => 8000, 'unidad' => 'KILO'],
            ['nombre' => 'CREMA DE COCO', 'precio' => 27000, 'unidad' => 'KILO'],
            ['nombre' => 'LIMON', 'precio' => 1800, 'unidad' => 'LIBRA'],
            ['nombre' => 'AZUCAR', 'precio' => 2200, 'unidad' => 'KILO'],
            ['nombre' => 'MYM GRANDE', 'precio' => 18500, 'unidad' => 'UNIDAD'],
            ['nombre' => 'CUCHARA', 'precio' => 4200, 'unidad' => 'UNIDAD'],
            ['nombre' => 'SODA', 'precio' => 2200, 'unidad' => 'LITRO'],
            ['nombre' => 'BUBOLS', 'precio' => 35000, 'unidad' => 'UNIDAD'],
            ['nombre' => 'PITILLOS', 'precio' => 6000, 'unidad' => 'UNIDAD'],
            ['nombre' => 'CORONITA', 'precio' => 2250, 'unidad' => 'UNIDAD'],
            ['nombre' => 'CUCHILLO', 'precio' => 4300, 'unidad' => 'UNIDAD'],
            ['nombre' => 'TENEDOR', 'precio' => 4500, 'unidad' => 'UNIDAD'],
            ['nombre' => 'NUTELLA', 'precio' => 9900, 'unidad' => 'KILO'],
            ['nombre' => 'CREPE', 'precio' => 800, 'unidad' => 'UNIDAD'],
            ['nombre' => 'CHOCO CUBIERTA', 'precio' => 34500, 'unidad' => 'KILO'],
            ['nombre' => 'ACEITE', 'precio' => 50, 'unidad' => 'LITRO'],
            ['nombre' => 'GRANADINA', 'precio' => 25600, 'unidad' => 'LITRO'],
            ['nombre' => 'GOMAS DE AROS', 'precio' => 100, 'unidad' => 'GRAMO'],
            ['nombre' => 'SAL DE COLOR', 'precio' => 8000, 'unidad' => 'KILO'],
            ['nombre' => 'MANO DE OBRA', 'precio' => 139, 'unidad' => 'UNIDAD'],
            ['nombre' => 'MEZCLA DE YUCA', 'precio' => 0, 'unidad' => 'KILO'],
            ['nombre' => 'MINI GOMA', 'precio' => 0, 'unidad' => 'GRAMO'],
            ['nombre' => 'MEZCLA WAFFLE', 'precio' => 0, 'unidad' => 'KILO'],
        ];

        foreach ($insumos as $insumo) {
            Insumo::updateOrCreate(
                ['nombre' => $insumo['nombre']],
                [
                    'precio' => $insumo['precio'],
                    'unidad' => $insumo['unidad'],
                ]
            );
        }
    }
}
