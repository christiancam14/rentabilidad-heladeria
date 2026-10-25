<?php

namespace App\Services;

use App\Models\Pedido;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Envía cada pedido nuevo del menú digital al grupo de Telegram de la heladería.
 * Si Telegram falla, el pedido igual queda registrado: solo se deja constancia en el log.
 */
class TelegramPedidos
{
    public function configurado(): bool
    {
        return filled(config('services.telegram.bot_token')) && filled(config('services.telegram.chat_id'));
    }

    public function notificarNuevo(int $pedidoId): void
    {
        $pedido = Pedido::with(['items', 'sede'])->find($pedidoId);

        if (! $pedido || ! $this->configurado()) {
            return;
        }

        $this->enviar($this->mensaje($pedido), $this->botones($pedido));
    }

    /**
     * @param  array<int, array<int, array{text: string, url: string}>>  $botones
     */
    public function enviar(string $html, array $botones = []): bool
    {
        if (! $this->configurado()) {
            return false;
        }

        try {
            $respuesta = Http::timeout(8)
                ->asJson()
                ->post('https://api.telegram.org/bot'.config('services.telegram.bot_token').'/sendMessage', array_filter([
                    'chat_id' => config('services.telegram.chat_id'),
                    'text' => $html,
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => true,
                    'reply_markup' => $botones ? ['inline_keyboard' => $botones] : null,
                ]));

            if ($respuesta->failed()) {
                Log::warning('Telegram rechazó el aviso de pedido', ['status' => $respuesta->status(), 'body' => $respuesta->json('description')]);

                return false;
            }

            return true;
        } catch (Throwable $e) {
            Log::warning('No se pudo enviar el aviso de pedido a Telegram', ['error' => $e->getMessage()]);

            return false;
        }
    }

    private function mensaje(Pedido $pedido): string
    {
        $e = fn (?string $texto) => htmlspecialchars((string) $texto, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $peso = fn (int $valor) => '$'.number_format($valor, 0, ',', '.');

        $lineas = [
            "🍨 <b>Nuevo pedido #{$e($pedido->codigo)}</b>",
            '📍 '.$e($pedido->sede->nombre).($pedido->listo_estimado ? ' · listo ~'.$pedido->listo_estimado->format('g:i a') : ''),
            '👤 '.$e($pedido->cliente_nombre).' · '.$e($pedido->cliente_telefono),
            '',
        ];

        foreach ($pedido->items as $item) {
            $lineas[] = "<b>{$item->cantidad}×</b> {$e($item->nombre)} — {$peso($item->total)}";
            if ($item->detalle) {
                $lineas[] = '    <i>'.$e($item->detalle).'</i>';
            }
        }

        $lineas[] = '';
        if ($pedido->regalo) {
            $lineas[] = '🎁 '.$e($pedido->regalo);
        }
        if ($pedido->descuento > 0) {
            $lineas[] = '🎟️ Cupón '.$e($pedido->cupon).': -'.$peso($pedido->descuento);
        }
        if ($pedido->notas) {
            $lineas[] = '✏️ '.$e($pedido->notas);
        }

        $lineas[] = "<b>Total: {$peso($pedido->total)}</b> · ".$e(Pedido::METODOS_PAGO[$pedido->metodo_pago] ?? $pedido->metodo_pago);

        return implode("\n", $lineas);
    }

    /** @return array<int, array<int, array{text: string, url: string}>> */
    private function botones(Pedido $pedido): array
    {
        $fila = [];

        $telefono = preg_replace('/\D/', '', $pedido->cliente_telefono);
        if ($telefono) {
            $telefono = strlen($telefono) === 10 ? '57'.$telefono : $telefono;
            $saludo = "¡Hola {$pedido->cliente_nombre}! Recibimos tu pedido #{$pedido->codigo} en A Tu Gusto 🍨";
            $fila[] = ['text' => '💬 WhatsApp cliente', 'url' => "https://wa.me/{$telefono}?text=".rawurlencode($saludo)];
        }

        // Telegram solo acepta enlaces públicos: en local (http://localhost) se omite el del panel
        $panel = url('/admin/pedidos');
        if (str_starts_with($panel, 'https://')) {
            $fila[] = ['text' => '🧾 Ver en el panel', 'url' => $panel];
        }

        return $fila ? [$fila] : [];
    }
}
