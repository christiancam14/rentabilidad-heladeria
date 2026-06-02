# Despliegue en Hostinger (GitHub)

## Checklist si sale "Deployment failed"

1. **Tipo de sitio:** debe ser **PHP** (Laravel), no una app **Node.js** separada en hPanel.
2. **Rama en Git:** `master` (la que uses en GitHub con `package.json` en la raíz).
3. **Carpeta de instalación:** raíz del clone (ej. `domains/tudominio.com/public_html`), **vacía** antes del primer deploy.
4. **Carpeta pública / Document root:** `public` (subcarpeta de Laravel).
5. **PHP:** 8.3.19 o superior en hPanel.
6. **`.env` en el servidor** antes del primer deploy (copiar de `.env.example` en File Manager o variables de Hostinger).
7. **Repo privado:** reconectar GitHub o añadir deploy key en GitHub → Settings → Deploy keys.
8. Abrir el **log** del deploy fallido (botón en la fila del deployment) y leer la última línea de error.

## Qué sube Git

| Sí en el repo | No en el repo |
|---------------|----------------|
| Código PHP, `public/build/` (assets Vite) | `.env`, `vendor/`, `node_modules/` |
| `package.json`, `composer.json`, `.htaccess` raíz | `public/hot`, logs, caché |

Antes de cada **push** a `master`:

```bash
npm ci
npm run build:vite
git add public/build
git commit -m "Build assets"
git push
```

En el servidor, `npm run build` **detecta** `public/build` sin `vendor` y **no** ejecuta Vite (evita fallo de Wayfinder).

## Panel Hostinger → Git

1. Conecta el repositorio `rentabilidad-heladeria`.
2. Rama: **master**.
3. Directorio de instalación: raíz del sitio (donde quedarán `package.json` y `app/`).
4. Document root: **public**.
5. Tras el primer clone exitoso, por SSH o Terminal:

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan config:cache
```

## Variables `.env` en producción

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

## GitHub Actions (opcional)

El workflow `.github/workflows/hostinger-build-check.yml` valida que el proyecto compile en cada push. No despliega solo; confirma que el código está bien antes de depender de Hostinger.

## Si Git de Hostinger sigue fallando

Usa **SFTP/FileZilla** o **GitHub Actions + SSH** (ver guías de Hostinger) subiendo el repo ya con `vendor` generado localmente (`composer install --no-dev`) y `public/build/`, o pide a soporte el **log completo** del deployment.
