/**
 * Hostinger suele ejecutar "npm run build" ANTES de "composer install".
 * Wayfinder/Vite necesitan PHP + vendor; si public/build ya está en Git, omitimos Vite.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const manifest = 'public/build/manifest.json';
const vendor = 'vendor/autoload.php';

if (existsSync(manifest) && !existsSync(vendor)) {
    console.log('✓ Assets en Git y sin vendor aún — omitiendo Vite (deploy Hostinger).');
    process.exit(0);
}

console.log('Compilando frontend con Vite...');

const result = spawnSync('npx', ['vite', 'build'], {
    stdio: 'inherit',
    shell: true,
});

process.exit(result.status === 0 ? 0 : 1);
