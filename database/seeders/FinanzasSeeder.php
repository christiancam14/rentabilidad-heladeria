<?php

namespace Database\Seeders;

use App\Models\ConceptoGastoFijo;
use App\Models\Sede;
use Illuminate\Database\Seeder;

class FinanzasSeeder extends Seeder
{
    private const CONCEPTOS_DEFAULT = [
        'Arriendo',
        'Agua',
        'Luz',
        'Internet',
        'Gas',
        'Vigilancia',
    ];

    public function run(): void
    {
        $sedes = [
            ['nombre' => 'Rocío', 'slug' => 'rocio'],
            ['nombre' => 'Marsella', 'slug' => 'marsella'],
        ];

        foreach ($sedes as $sedeData) {
            $sede = Sede::firstOrCreate(
                ['slug' => $sedeData['slug']],
                ['nombre' => $sedeData['nombre']],
            );

            foreach (self::CONCEPTOS_DEFAULT as $nombre) {
                ConceptoGastoFijo::firstOrCreate(
                    [
                        'sede_id' => $sede->id,
                        'nombre' => $nombre,
                    ],
                );
            }
        }
    }
}
