<?php

$path = __DIR__ . '/../database/seeders/ProductoSeeder.php';
$content = file_get_contents($path);

$pattern = '/(\$producto\d+) = Producto::updateOrCreate\([^;]+;\s*)\1->insumos\(\)->detach\(\);\s*((?:\1->agregarInsumo\([^;]+;\s*)+)/s';

$content = preg_replace_callback($pattern, function (array $m): string {
    $var = $m[1];
    if (! preg_match_all("/agregarInsumo\(\\\$getInsumo\('([^']+)'\),\s*([^)]+)\)/", $m[2], $ins, PREG_SET_ORDER)) {
        return $m[0];
    }
    $lines = array_map(static function (array $i): string {
        $nombre = str_replace("'", "\\'", $i[1]);

        return "            ['{$nombre}', ".trim($i[2]).'],';
    }, $ins);

    return $m[1]."\$this->receta({$var}, \$getInsumo, [\n".implode("\n", $lines)."\n        ]);\n";
}, $content);

$recetaMethod = <<<'PHP'

    /**
     * @param  callable(string): \App\Models\Insumo  $getInsumo
     * @param  array<int, array{0: string, 1: float}>  $lineas
     */
    private function receta(Producto $producto, callable $getInsumo, array $lineas): void
    {
        $producto->sincronizarInsumosReceta(
            array_map(
                static fn (array $linea): array => [$getInsumo($linea[0]), $linea[1]],
                $lineas
            )
        );
    }

PHP;

if (! str_contains($content, 'private function receta(')) {
    $content = str_replace(
        "    private function seedProductos(\$getInsumo): void\n    {",
        $recetaMethod."    private function seedProductos(\$getInsumo): void\n    {",
        $content
    );
}

// Remove defer recalc block - sincronizarInsumosReceta already recalculates
$content = preg_replace(
    '/\s*Producto::\$omitirRecalculoEnAgregar = true;\s*try \{\s*/',
    "\n            ",
    $content
);
$content = preg_replace(
    '/\s*\} finally \{\s*Producto::\$omitirRecalculoEnAgregar = false;\s*\}\s*Producto::query\(\)->each\(fn \(Producto \$producto\) => \$producto->recalcularTotales\(\)\);\s*/',
    "\n            ",
    $content
);

file_put_contents($path, $content);
echo "Refactored ProductoSeeder\n";
