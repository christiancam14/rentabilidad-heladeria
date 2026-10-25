<?php

namespace App\Support;

use Composer\Script\Event;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Foundation\PackageManifest;

/**
 * Scripts de Composer que corren dentro del mismo proceso.
 *
 * El deploy por Git de Hostinger usa un PHP sin `proc_open`, así que
 * `@php artisan package:discover` (que abre un proceso aparte) hace fallar
 * `composer install`. Aquí se genera el mismo manifiesto de paquetes
 * (bootstrap/cache/packages.php) sin arrancar la consola de Laravel, que
 * chocaría con las librerías que trae Composer.
 */
class ComposerScripts
{
    public static function packageDiscover(Event $event): void
    {
        $vendor = $event->getComposer()->getConfig()->get('vendor-dir');
        require_once $vendor.'/autoload.php';

        $base = dirname($vendor);
        $manifest = new PackageManifest(new Filesystem, $base, $base.'/bootstrap/cache/packages.php');
        $manifest->vendorPath = $vendor;
        $manifest->build();

        $paquetes = array_keys(require $base.'/bootstrap/cache/packages.php');
        $event->getIO()->write('<info>Paquetes de Laravel descubiertos: '.implode(', ', $paquetes).'</info>');
    }
}
