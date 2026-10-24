import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        items: { nombre: string; detalle: string | null; cantidad: number; total: number }[];
    };
    sede: { nombre: string; slug: string; direccion: string | null };
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
        .toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true })
        .replace('a. m.', 'a.m.')
        .replace('p. m.', 'p.m.');
}

/** 4 · Confirmación — seguimiento del pedido en vivo. */
export default function PedidoConfirmado({ pedido, sede, whatsapp_url, enviar, cupon }: Props) {
    const [abriendo, setAbriendo] = useState(enviar && !!whatsapp_url);
    const terminado = pedido.estado === 'entregado' || pedido.estado === 'cancelado';
    const paso = pedido.estado === 'entregado' ? 3 : PASOS.findIndex((p) => p.clave === pedido.estado) + 1;

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
        const id = window.setInterval(() => router.reload({ only: ['pedido'] }), 15000);
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
            <div className="min-h-svh bg-[#00b3c5] text-tinta">
                <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col items-center bg-turquesa px-4 pt-14 pb-10">
                    <Logo variante="rosa" className="w-[150px]" />

                    <h1 className="font-display mt-5 text-center text-[52px] leading-[0.9] font-extrabold tracking-[-0.04em] text-white">
                        {titulo[0]}
                        <br />
                        <span className="font-serif font-normal tracking-[-0.02em] text-amarillo italic">{titulo[1]}</span>
                    </h1>
                    <p className="text-meta mt-5 text-white/90">Pedido #{pedido.codigo}</p>

                    {abriendo && (
                        <p className="mt-4 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">Abriendo WhatsApp…</p>
                    )}

                    <div className="mt-5 w-full rounded-[28px] bg-hueso p-6">
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
                                    {sede.direccion ? ` · ${sede.direccion}` : ''}
                                </p>
                                <div className="mt-4 grid grid-cols-3 gap-1.5">
                                    {PASOS.map((p, i) => (
                                        <div key={p.clave}>
                                            <div className={cn('h-1.5 rounded-full transition-colors', i < paso ? 'bg-rosa' : 'bg-tinta/12')} />
                                            <p className={cn('text-meta mt-1.5 text-[10px]', i < paso ? 'text-tinta' : 'text-tinta/50')}>{p.texto}</p>
                                        </div>
                                    ))}
                                </div>
                                <hr className="my-4 border-tinta/10" />
                            </>
                        )}

                        <ul className="flex flex-col gap-3">
                            {pedido.items.map((item, i) => (
                                <li key={i} className="flex justify-between gap-3 text-[15px] font-medium">
                                    <span>
                                        {item.cantidad}× {item.nombre}
                                        {item.detalle && <span className="block text-xs text-tinta/55">{item.detalle}</span>}
                                    </span>
                                    <span className="tabular-nums">{formatPrice(item.total)}</span>
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
                                    <span className="tabular-nums">-{formatPrice(pedido.descuento)}</span>
                                </li>
                            )}
                        </ul>
                        <div className="font-display mt-4 flex justify-between text-xl font-bold tracking-[-0.02em]">
                            <span>Total · {pedido.metodo_pago === 'Caja' ? 'pago en caja' : pedido.metodo_pago.toLowerCase()}</span>
                            <span className="tabular-nums">{formatPrice(pedido.total)}</span>
                        </div>
                    </div>

                    {cupon && (
                        <div className="mt-5 w-full rounded-[22px] bg-amarillo px-5 py-4">
                            <p className="text-meta text-[10px]">Para tu próxima visita</p>
                            <p className="font-display mt-1 text-lg font-bold tracking-[-0.02em]">
                                -{cupon.porcentaje}% con el código {cupon.codigo}
                            </p>
                        </div>
                    )}

                    <div className="mt-5 flex w-full flex-col gap-3">
                        {whatsapp_url && !terminado && (
                            <a
                                href={whatsapp_url}
                                className="font-display flex h-[60px] items-center justify-between rounded-full bg-tinta px-6 text-[17px] font-bold text-hueso"
                            >
                                Enviar por WhatsApp <span>💬</span>
                            </a>
                        )}
                        <Link
                            href={`/?sede=${sede.slug}`}
                            className="font-display flex h-[60px] items-center justify-between rounded-full bg-rosa px-6 text-[17px] font-bold text-white"
                        >
                            Pedir de nuevo <ArrowRight className="size-5" strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
