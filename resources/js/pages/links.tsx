import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

import { Credito } from '@/components/brand/credito';
import { Logo } from '@/components/brand/logo';
import { IconoWhatsapp, REDES } from '@/components/brand/redes';
import { type MenuSede, type Negocio, type RedSocial } from '@/types/menu';

interface Props {
    negocio: Negocio;
    sedes: MenuSede[];
}

function hora12(h: string): string {
    const [hh, mm] = h.split(':').map(Number);
    return `${hh % 12 || 12}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${hh >= 12 ? 'p.m.' : 'a.m.'}`;
}

/** Usuario visible de una URL de red social: @heladeriaatugusto */
function usuario(url: string): string {
    try {
        const ruta = new URL(url).pathname.split('/').filter(Boolean)[0] ?? '';
        return ruta.startsWith('@') ? ruta : `@${ruta}`;
    } catch {
        return url;
    }
}

/** Página de enlaces tipo Linktree para la bio de redes sociales. */
export default function Links({ negocio, sedes }: Props) {
    const redes = (Object.keys(REDES) as RedSocial[]).filter(
        (r) => negocio.redes[r],
    );

    return (
        <>
            <Head title="Enlaces">
                <meta
                    name="description"
                    content={`${negocio.nombre}: pide en línea, escríbenos por WhatsApp y encuéntranos en redes.`}
                />
            </Head>

            <div className="min-h-svh bg-turquesa text-tinta">
                <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col items-center px-4 pt-12 pb-10">
                    <Logo variante="rosa" className="w-[150px]" />
                    <h1 className="mt-5 text-center font-display text-[40px] leading-[0.9] font-extrabold tracking-[-0.04em] text-white">
                        ¿Qué se te
                        <br />
                        <span className="font-serif font-normal tracking-[-0.02em] text-amarillo italic">
                            antoja hoy?
                        </span>
                    </h1>
                    <p className="mt-4 text-meta text-white/85">
                        {negocio.nombre} · Bucaramanga
                    </p>

                    <Link
                        href="/"
                        className="mt-7 flex h-[64px] w-full items-center justify-between rounded-full bg-rosa px-7 font-display text-lg font-bold tracking-[-0.02em] text-white shadow-[0_18px_40px_-16px_rgba(11,46,54,0.6)] transition-transform hover:-translate-y-0.5"
                    >
                        <span>🍨 Pide para recoger</span>
                        <ArrowRight className="size-5" strokeWidth={2.5} />
                    </Link>

                    <section className="mt-6 flex w-full flex-col gap-3">
                        {sedes.map((s) => (
                            <article
                                key={s.id}
                                className="rounded-[26px] bg-hueso p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-meta text-tinta/55">
                                            Sede
                                        </p>
                                        <h2 className="font-display text-[22px] leading-tight font-bold tracking-[-0.02em]">
                                            {s.nombre}
                                        </h2>
                                        {s.direccion && (
                                            <p className="mt-0.5 text-sm font-medium text-tinta/70">
                                                {s.direccion}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={
                                            s.recibiendo_pedidos
                                                ? 'rounded-full bg-turquesa-suave px-2.5 py-1.5 text-meta'
                                                : 'rounded-full bg-rosa-suave px-2.5 py-1.5 text-meta'
                                        }
                                    >
                                        {s.recibiendo_pedidos
                                            ? 'Abierta'
                                            : 'Cerrada'}
                                    </span>
                                </div>
                                {s.horarios.length > 0 && (
                                    <ul className="mt-3 flex flex-col gap-1 text-[13px] font-medium text-tinta/70">
                                        {s.horarios.map((h) => (
                                            <li
                                                key={h.dias}
                                                className="flex items-center gap-2"
                                            >
                                                <Clock className="size-3.5 shrink-0 text-tinta/40" />
                                                <span className="flex-1">
                                                    {h.dias}
                                                </span>
                                                <span className="tabular-nums">
                                                    {hora12(h.abre)} –{' '}
                                                    {hora12(h.cierra)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    {s.whatsapp_url && (
                                        <a
                                            href={s.whatsapp_url}
                                            target="_blank"
                                            rel="noopener"
                                            className="flex h-12 items-center justify-center gap-2 rounded-full bg-tinta font-display text-sm font-bold text-hueso"
                                        >
                                            <IconoWhatsapp className="size-[18px]" />{' '}
                                            WhatsApp
                                        </a>
                                    )}
                                    {s.maps_url && (
                                        <a
                                            href={s.maps_url}
                                            target="_blank"
                                            rel="noopener"
                                            className="flex h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-tinta font-display text-sm font-bold"
                                        >
                                            <MapPin className="size-[18px]" />{' '}
                                            Cómo llegar
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </section>

                    {redes.length > 0 && (
                        <section className="mt-6 flex w-full flex-col gap-2.5">
                            <p className="text-center text-meta text-white/85">
                                Síguenos
                            </p>
                            {redes.map((r) => {
                                const { nombre, Icono } = REDES[r];
                                return (
                                    <a
                                        key={r}
                                        href={negocio.redes[r]}
                                        target="_blank"
                                        rel="noopener"
                                        className="flex h-14 items-center gap-3 rounded-full bg-white px-5 transition-transform hover:-translate-y-0.5"
                                    >
                                        <Icono className="size-[22px] shrink-0 text-rosa" />
                                        <span className="flex-1 font-display text-base font-bold tracking-[-0.02em]">
                                            {nombre}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate text-right text-sm font-medium text-tinta/50">
                                            {usuario(negocio.redes[r]!)}
                                        </span>
                                    </a>
                                );
                            })}
                        </section>
                    )}

                    <Credito claro className="mt-auto pt-10" />
                </div>
            </div>
        </>
    );
}
