<?php

use App\Services\TelegramPedidos;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('telegram:probar', function (TelegramPedidos $telegram) {
    if (! $telegram->configurado()) {
        $this->error('Faltan TELEGRAM_BOT_TOKEN y/o TELEGRAM_CHAT_ID en el .env.');

        return 1;
    }

    $ok = $telegram->enviar("✅ <b>Bot conectado</b>\nAquí llegarán los pedidos del menú digital de A Tu Gusto 🍨");
    $ok ? $this->info('Mensaje de prueba enviado al grupo.') : $this->error('Telegram rechazó el mensaje: revisa storage/logs/laravel.log');

    return $ok ? 0 : 1;
})->purpose('Envía un mensaje de prueba al grupo de Telegram de pedidos');
