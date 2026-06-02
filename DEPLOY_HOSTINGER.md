# Despliegue en Hostinger (GitHub)

## Qué sube Git

| Sí en el repo | No en el repo |
|---------------|----------------|
| Código PHP, `public/build/` (assets Vite) | `.env`, `vendor/`, `node_modules/` |
| Migraciones, vistas, `resources/js` fuente | `public/hot`, logs, caché de `storage/` |

Antes de cada **push** a la rama que despliega Hostinger:

```bash
npm ci
npm run build
```

Así `public/build/` queda actualizado y la app carga CSS/JS en producción.

## Panel Hostinger → Git / Deploy

1. Conecta el repositorio de GitHub.
2. **Directorio público (document root):** `public` (no la raíz del proyecto).
3. Rama: `main` (o la que uses).
4. Variables de entorno: copia `.env.example` y configura en Hostinger (o archivo `.env` en el servidor **fuera** de Git):
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://tu-dominio.com`
   - Credenciales MySQL de Hostinger
   - `CACHE_STORE=file`, `SESSION_DRIVER=file`, `QUEUE_CONNECTION=sync`

## Comandos en el servidor (SSH o “Run script” del deploy)

Tras cada despliegue:

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Si no hay SSH, usa el instalador de Composer del panel y ejecuta migraciones desde **Terminal** de hPanel cuando esté disponible.

## Primera vez

```bash
php artisan db:seed --class=FinanzasSeeder --force
# Opcional: php artisan db:seed --force
```

## Comprobar

- Abre `/login` y revisa que carguen estilos (sin errores 404 a `/build/assets/...`).
- `php artisan migrate:status` debe listar todas las migraciones como **Ran**.
