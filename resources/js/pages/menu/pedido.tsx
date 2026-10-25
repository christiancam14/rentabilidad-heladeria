import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Credito } from '@/components/brand/credito';
import { Logo } from '@/components/brand/logo';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils';

interface Props {
    pedido: {
        codigo: string;
        estado: 'nuevo' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
        cliente_nombre: string;
        metodo_pago: string;
        subtotal: number;
        descuento: number;
        total: number;
        regalo: string | null;
        listo_estimado: string | null;
        items: {
            nombre: string;
            detalle: string | null;
            cantidad: number;
            total: number;
        }[];
    };
    sede: {
        nombre: string;
        slug: string;
        direccion: string | null;
        maps_url: string | null;
    };
    whatsapp_url: string | null;
    enviar: boolean;
    cupon: { codigo: string; porcentaje: number } | null;
}

const PASOS = [
    { clave: 'nuevo', texto: 'Recibido' },
    { clave: 'preparando', texto: 'Preparando' },
    { clave: 'listo', texto: 'Listo' },
] as const;

function hora(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso)
        .toLocaleTimeString('es-CO', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
        .replace('a. m.', 'a.m.')
        .replace('p. m.', 'p.m.');
}

/** 4 · Confirmación — seguimiento del pedido en vivo. */
export default function PedidoConfirmado({
    pedido,
    sede,
    whatsapp_url,
    enviar,
    cupon,
}: Props) {
    const [abriendo, setAbriendo] = useState(enviar && !!whatsapp_url);
    const terminado =
        pedido.estado === 'entregado' || pedido.estado === 'cancelado';
    const paso =
        pedido.estado === 'entregado'
            ? 3
            : PASOS.findIndex((p) => p.clave === pedido.estado) + 1;

    // Abre WhatsApp con el resumen del pedido para la sede
    useEffect(() => {
        if (!abriendo || !whatsapp_url) return;
        const t = window.setTimeout(() => {
            window.history.replaceState({}, '', window.location.pathname);
            window.location.href = whatsapp_url;
            setAbriendo(false);
        }, 1200);
        return () => window.clearTimeout(t);
    }, [abriendo, whatsapp_url]);

    // Estado en vivo mientras el pedido está en curso
    useEffect(() => {
        if (terminado) return;
        const id = window.setInterval(
            () => router.reload({ only: ['pedido'] }),
            15000,
        );
        return () => window.clearInterval(id);
    }, [terminado]);

    const titulo =
        pedido.estado === 'listo'
            ? ['¡Tu pedido', 'está listo!']
            : pedido.estado === 'entregado'
              ? ['¡Gracias por', 'tu visita!']
              : pedido.estado === 'cancelado'
                ? ['Pedido', 'cancelado']
                : ['¡Pedido', 'recibido!'];

    return (
        <>
            <Head title={`Pedido #${pedido.codigo}`} />
            <div className="min-h-svh bg-turquesa text-tinta">
                <div className="mx-auto grid min-h-svh w-full max-w-[480px] content-start px-4 pt-14 pb-10 md:max-w-[560px] md:pt-16 lg:max-w-[1080px] lg:grid-cols-[minmax(0,1fr)_480px] lg:content-center lg:items-center lg:gap-16 lg:px-10 lg:py-16">
                    <div className="flex flex-col items-center lg:items-start">
                        <Logo
                            variante="rosa"
                            className="w-[150px] lg:w-[190px]"
                        />

                        <h1 className="mt-5 text-center font-display text-[52px] leading-[0.9] font-extrabold tracking-[-0.04em] text-white md:text-[64px] lg:text-left lg:text-[88px]">
                            {titulo[0]}
                            <br />
                            <span className="font-serif font-normal tracking-[-0.02em] text-amarillo italic">
                                {titulo[1]}
                            </span>
                        </h1>
                        <p className="mt-5 text-meta text-white/90 lg:text-[13px]">
                            Pedido #{pedido.codigo}
                        </p>

                        {abriendo && (
                            <p className="mt-4 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
                                Abriendo WhatsApp…
                            </p>
                        )}
                    </div>

                    <div className="flex w-full flex-col items-center">
                        <div className="mt-5 w-full rounded-[28px] bg-hueso p-6 md:p-7 lg:mt-0">
                            {pedido.estado !== 'cancelado' && (
                                <>
                                    <p className="font-display text-[24px] leading-tight font-bold tracking-[-0.02em]">
                                        {pedido.estado === 'listo'
                                            ? 'Ya puedes recogerlo'
                                            : pedido.estado === 'entregado'
                                              ? 'Pedido entregado'
                                              : `Listo a las ${hora(pedido.listo_estimado)}`}
                                    </p>
                                    <p className="mt-2 text-[15px] font-medium text-tinta/80">
                                        Recoge en {sede.nombre}
                                        {sede.direccion
                                            ? ` · ${sede.direccion}`
                                            : ''}
                                    </p>
                                    {sede.maps_url && (
                                        <a
                                            href={sede.maps_url}
                                            target="_blank"
                                            rel="noopener"
                                            className="mt-2 inline-flex items-center gap-1.5 text-meta text-rosa"
                                        >
                                            <MapPin className="size-3.5" />
                                            Cómo llegar
                                        </a>
                                    )}
                                    <div className="mt-4 grid grid-cols-3 gap-1.5">
                                        {PASOS.map((p, i) => (
                                            <div key={p.clave}>
                                                <div
                                                    className={cn(
                                                        'h-1.5 rounded-full transition-colors',
                                                        i < paso
                                                            ? 'bg-rosa'
                                                            : 'bg-tinta/12',
                                                    )}
                                                />
                                                <p
                                                    className={cn(
                                                        'mt-1.5 text-meta text-[10px]',
                                                        i < paso
                                                            ? 'text-tinta'
                                                            : 'text-tinta/50',
                                                    )}
                                                >
                                                    {p.texto}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <hr className="my-4 border-tinta/10" />
                                </>
                            )}

                            <ul className="flex flex-col gap-3">
                                {pedido.items.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex justify-between gap-3 text-[15px] font-medium"
                                    >
                                        <span>
                                            {item.cantidad}× {item.nombre}
                                            {item.detalle && (
                                                <span className="block text-xs text-tinta/55">
                                                    {item.detalle}
                                                </span>
                                            )}
                                        </span>
                                        <span className="tabular-nums">
                                            {formatPrice(item.total)}
                                        </span>
                                    </li>
                                ))}
                                {pedido.regalo && (
                                    <li className="flex justify-between text-[15px] font-medium">
                                        <span>🎁 {pedido.regalo}</span>
                                        <span>Gratis</span>
                                    </li>
                                )}
                                {pedido.descuento > 0 && (
                                    <li className="flex justify-between text-[15px] font-medium">
                                        <span>Descuento</span>
                                        <span className="tabular-nums">
                                            -{formatPrice(pedido.descuento)}
                                        </span>
                                    </li>
                                )}
                            </ul>
                            <div className="mt-4 flex justify-between font-display text-xl font-bold tracking-[-0.02em]">
                                <span>
                                    Total ·{' '}
                                    {pedido.metodo_pago === 'Caja'
                                        ? 'pago en caja'
                                        : pedido.metodo_pago.toLowerCase()}
                                </span>
                                <span className="tabular-nums">
                                    {formatPrice(pedido.total)}
                                </span>
                            </div>
                        </div>

                        {cupon && (
                            <div className="mt-5 w-full rounded-[22px] bg-amarillo px-5 py-4">
                                <p className="text-meta text-[10px]">
                                    Para tu próxima visita
                                </p>
                                <p className="mt-1 font-display text-lg font-bold tracking-[-0.02em]">
                                    -{cupon.porcentaje}% con el código{' '}
                                    {cupon.codigo}
                                </p>
                            </div>
                        )}

                        <div className="mt-5 flex w-full flex-col gap-3">
                            {whatsapp_url && !terminado && (
                                <a
                                    href={whatsapp_url}
                                    className="flex h-[60px] items-center justify-between rounded-full bg-tinta px-6 font-display text-[17px] font-bold text-hueso"
                                >
                                    Enviar por WhatsApp <span>💬</span>
                                </a>
                            )}
                            <Link
                                href={`/?sede=${sede.slug}`}
                                className="flex h-[60px] items-center justify-between rounded-full bg-rosa px-6 font-display text-[17px] font-bold text-white"
                            >
                                Pedir de nuevo{' '}
                                <ArrowRight
                                    className="size-5"
                                    strokeWidth={2.5}
                                />
                            </Link>
                        </div>
                        <Credito claro className="mt-8 text-center" />
                    </div>
                </div>
            </div>
        </>
    );
}
