import { Head, router } from '@inertiajs/react';
import { type ReactNode, useEffect, useState } from 'react';

import { PageHeader } from '@/components/brand/panel';
import { PillButton } from '@/components/brand/pill-button';
import AppLayout from '@/layouts/app-layout';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils';

type Estado = 'nuevo' | 'preparando' | 'listo' | 'entregado' | 'cancelado';

interface Pedido {
    id: number;
    codigo: string;
    estado: Estado;
    cliente_nombre: string;
    cliente_telefono: string;
    metodo_pago: string;
    notas: string | null;
    regalo: string | null;
    cupon: string | null;
    total: number;
    creado: string;
    items: { cantidad: number; nombre: string; detalle: string | null }[];
}

interface Props {
    sede: { id: number; nombre: string; recibiendo_pedidos: boolean } | null;
    kpis: {
        ventas: number;
        variacion: number | null;
        dia_comparado: string;
        pedidos: number;
        en_curso: number;
        ticket_promedio: number;
        mas_vendido: { nombre: string; unidades: number } | null;
    };
    pedidos: Pedido[];
}

const COLUMNAS: { estado: Estado; titulo: string; punto: string; accion?: { texto: string; siguiente: Estado; clase: string } }[] = [
    { estado: 'nuevo', titulo: 'Nuevos', punto: 'bg-rosa', accion: { texto: 'Preparar →', siguiente: 'preparando', clase: 'bg-rosa text-white' } },
    {
        estado: 'preparando',
        titulo: 'Preparando',
        punto: 'bg-amarillo',
        accion: { texto: 'Marcar listo →', siguiente: 'listo', clase: 'bg-tinta text-white' },
    },
    {
        estado: 'listo',
        titulo: 'Listos para recoger',
        punto: 'bg-turquesa',
        accion: { texto: 'Entregado ✓', siguiente: 'entregado', clase: 'bg-turquesa text-white' },
    },
];

function haceMinutos(iso: string, ahora: number): string {
    const min = Math.max(0, Math.floor((ahora - new Date(iso).getTime()) / 60000));
    if (min < 1) return 'ahora';
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    return `hace ${h} h`;
}

/** D · Pedidos en vivo: KPIs del día + tablero por estado. */
export default function PedidosEnVivo({ sede, kpis, pedidos }: Props) {
    const [ahora, setAhora] = useState(() => Date.now());
    const [verCerrados, setVerCerrados] = useState(false);

    useEffect(() => {
        const id = window.setInterval(() => {
            setAhora(Date.now());
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['pedidos', 'kpis', 'admin'] });
            }
        }, 10000);
        return () => window.clearInterval(id);
    }, []);

    const mover = (pedido: Pedido, estado: Estado) =>
        router.patch(`/admin/pedidos/${pedido.id}`, { estado }, { preserveScroll: true, only: ['pedidos', 'kpis', 'admin'] });

    const cerrados = pedidos.filter((p) => p.estado === 'entregado' || p.estado === 'cancelado');

    return (
        <AppLayout>
            <Head title="Pedidos de hoy" />

            <PageHeader
                titulo="Pedidos de hoy"
                descripcion={sede ? `${sede.nombre} · se actualiza en tiempo real` : 'Configura una sede para recibir pedidos'}
                acciones={
                    sede && (
                        <PillButton
                            variante={sede.recibiendo_pedidos ? 'contorno' : 'rosa'}
                            tamano="lg"
                            flecha
                            onClick={() =>
                                router.post('/admin/sede-activa/recibiendo', { sede_id: sede.id, recibiendo_pedidos: !sede.recibiendo_pedidos })
                            }
                        >
                            {sede.recibiendo_pedidos ? 'Pausar pedidos' : 'Reanudar pedidos'}
                        </PillButton>
                    )
                }
            />

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <Kpi fondo="bg-turquesa text-white" etiqueta="Ventas de hoy" valor={formatPrice(kpis.ventas)}>
                    {kpis.variacion !== null
                        ? `${kpis.variacion >= 0 ? '↑' : '↓'} ${Math.abs(kpis.variacion)}% vs. ${kpis.dia_comparado} pasado`
                        : 'Sin datos de la semana pasada'}
                </Kpi>
                <Kpi fondo="bg-white" etiqueta="Pedidos" valor={String(kpis.pedidos)}>
                    {kpis.en_curso} en curso
                </Kpi>
                <Kpi fondo="bg-amarillo" etiqueta="Ticket promedio" valor={formatPrice(kpis.ticket_promedio)}>
                    por pedido
                </Kpi>
                <Kpi fondo="bg-white" etiqueta="Más vendido" valor={kpis.mas_vendido?.nombre ?? '—'} valorChico>
                    {kpis.mas_vendido ? `${kpis.mas_vendido.unidades} unidades` : 'Aún sin ventas'}
                </Kpi>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-3">
                {COLUMNAS.map((col) => {
                    const lista = pedidos.filter((p) => p.estado === col.estado);
                    return (
                        <section key={col.estado} className="flex flex-col gap-3 rounded-[24px] bg-arena/70 p-3.5">
                            <header className="flex items-center gap-2 px-1.5 pt-1">
                                <span className={cn('size-2.5 rounded-full', col.punto)} />
                                <h2 className="font-display text-[17px] font-bold tracking-[-0.02em]">{col.titulo}</h2>
                                <span className="text-meta text-tinta/50">{lista.length}</span>
                            </header>
                            {lista.length === 0 && <p className="px-2 pt-1 pb-3 text-sm text-tinta/45">Sin pedidos por ahora</p>}
                            {lista.map((p) => (
                                <TarjetaPedido
                                    key={p.id}
                                    pedido={p}
                                    hace={haceMinutos(p.creado, ahora)}
                                    accion={col.accion}
                                    onAccion={(e) => mover(p, e)}
                                />
                            ))}
                        </section>
                    );
                })}
            </div>

            {cerrados.length > 0 && (
                <div>
                    <button type="button" onClick={() => setVerCerrados((v) => !v)} className="text-meta text-tinta/60 hover:text-tinta">
                        {verCerrados ? 'Ocultar' : 'Ver'} entregados y cancelados ({cerrados.length})
                    </button>
                    {verCerrados && (
                        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {cerrados.map((p) => (
                                <TarjetaPedido key={p.id} pedido={p} hace={haceMinutos(p.creado, ahora)} onAccion={(e) => mover(p, e)} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </AppLayout>
    );
}

function Kpi({
    fondo,
    etiqueta,
    valor,
    valorChico,
    children,
}: {
    fondo: string;
    etiqueta: string;
    valor: string;
    valorChico?: boolean;
    children: ReactNode;
}) {
    return (
        <div className={cn('flex flex-col gap-1.5 rounded-[24px] border border-tinta/8 p-[22px]', fondo)}>
            <p className="text-meta text-[11px] opacity-80">{etiqueta}</p>
            <p
                className={cn(
                    'font-display leading-none font-extrabold tracking-[-0.04em]',
                    valorChico ? 'truncate text-[26px]' : 'text-[34px]',
                )}
            >
                {valor}
            </p>
            <p className="text-xs font-medium opacity-80">{children}</p>
        </div>
    );
}

/** Admin / Tarjeta pedido */
function TarjetaPedido({
    pedido,
    hace,
    accion,
    onAccion,
}: {
    pedido: Pedido;
    hace: string;
    accion?: { texto: string; siguiente: Estado; clase: string };
    onAccion: (estado: Estado) => void;
}) {
    const telefono = pedido.cliente_telefono.replace(/\D/g, '');
    const wa = telefono ? `https://wa.me/${telefono.length === 10 ? `57${telefono}` : telefono}` : null;

    return (
        <article className={cn('flex flex-col gap-2.5 rounded-[20px] border border-tinta/8 bg-white p-[18px]', pedido.estado === 'cancelado' && 'opacity-60')}>
            <div className="flex items-center justify-between">
                <p className="font-display text-[17px] font-bold tracking-[-0.02em]">#{pedido.codigo}</p>
                <p className="text-meta text-[10px] text-rosa">{pedido.estado === 'cancelado' ? 'Cancelado' : hace}</p>
            </div>
            <p className="text-[13px] font-medium text-tinta/65">
                {pedido.cliente_nombre} ·{' '}
                {wa ? (
                    <a href={wa} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                        {pedido.cliente_telefono}
                    </a>
                ) : (
                    pedido.cliente_telefono
                )}
            </p>
            <ul className="text-[13px] leading-[1.45] font-medium">
                {pedido.items.map((i, idx) => (
                    <li key={idx}>
                        {i.cantidad}× {i.nombre}
                        {i.detalle && <span className="text-tinta/60"> ({i.detalle})</span>}
                    </li>
                ))}
                {pedido.regalo && <li>🎁 {pedido.regalo}</li>}
            </ul>
            {pedido.notas && <p className="rounded-xl bg-amarillo-suave px-3 py-2 text-xs font-medium">✏️ {pedido.notas}</p>}
            <div className="flex items-center justify-between gap-2">
                <p className="font-display text-[15px] font-bold tracking-[-0.02em]">
                    {formatPrice(pedido.total)} · {pedido.metodo_pago}
                </p>
                {accion && (
                    <button
                        type="button"
                        onClick={() => onAccion(accion.siguiente)}
                        className={cn('font-display rounded-full px-3.5 py-2 text-[13px] font-bold whitespace-nowrap', accion.clase)}
                    >
                        {accion.texto}
                    </button>
                )}
            </div>
            {pedido.estado === 'nuevo' && (
                <button
                    type="button"
                    onClick={() => confirm(`¿Cancelar el pedido #${pedido.codigo}?`) && onAccion('cancelado')}
                    className="text-meta self-start text-[10px] text-tinta/45 hover:text-rosa"
                >
                    Cancelar
                </button>
            )}
        </article>
    );
}
