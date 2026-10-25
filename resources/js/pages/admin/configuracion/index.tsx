import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { Campo, CampoSelector } from '@/components/brand/campo';
import { Logo } from '@/components/brand/logo';
import { FilaToggle, PageHeader, Panel } from '@/components/brand/panel';
import { PillButton } from '@/components/brand/pill-button';
import { Toggle } from '@/components/brand/toggle';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Horario {
    dias: string;
    abre: string;
    cierra: string;
    activo: boolean;
}

interface Sede {
    id: number;
    nombre: string;
    direccion: string;
    whatsapp: string;
    maps_url: string;
    tiempo_preparacion: number;
    recibiendo_pedidos: boolean;
    en_menu: boolean;
    horarios: Horario[];
}

interface Config {
    negocio_nombre: string;
    negocio_eslogan: string;
    negocio_instagram: string;
    negocio_facebook: string;
    negocio_tiktok: string;
    pedido_minimo: number;
    meta_regalo_activa: boolean;
    meta_regalo_desde: number;
    meta_regalo_texto: string;
    sugerencias_producto: boolean;
    sugerencias_carrito: boolean;
    cupon_confirmacion_activo: boolean;
    cupon_confirmacion_codigo: string;
    pago_caja: boolean;
    pago_transferencia: boolean;
    pago_nequi: boolean;
}

interface Props {
    config: Config;
    sedes: Sede[];
    cupones: { codigo: string; porcentaje: number }[];
}

const TABS = [
    { id: 'negocio', titulo: 'Negocio' },
    { id: 'sedes', titulo: 'Sedes y horarios' },
    { id: 'pedidos', titulo: 'Pedidos y pagos' },
    { id: 'apariencia', titulo: 'Apariencia' },
] as const;

type Tab = (typeof TABS)[number]['id'];

const conMiles = (v: number | string) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const digitos = (v: string) => Number(v.replace(/\D/g, '') || 0);

function hora12(h: string): string {
    const [hh, mm] = h.split(':').map(Number);
    const sufijo = hh >= 12 ? 'p.m.' : 'a.m.';
    return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${sufijo}`;
}

/** C · Configuración */
export default function Configuracion({ config, sedes, cupones }: Props) {
    const [tab, setTab] = useState<Tab>('sedes');
    const form = useForm({ config, sedes });
    const { data, setData, errors } = form;
    const err = errors as Record<string, string>;

    const conf = <K extends keyof Config>(k: K, v: Config[K]) => setData('config', { ...data.config, [k]: v });
    const sede = (i: number, cambio: Partial<Sede>) => setData('sedes', data.sedes.map((s, j) => (j === i ? { ...s, ...cambio } : s)));
    const horario = (i: number, h: number, cambio: Partial<Horario>) =>
        sede(i, { horarios: data.sedes[i].horarios.map((x, k) => (k === h ? { ...x, ...cambio } : x)) });

    const guardar = (e?: FormEvent) => {
        e?.preventDefault();
        form.put('/admin/configuracion', {
            preserveScroll: true,
            onSuccess: () => toast.success('Configuración guardada'),
            onError: (errs) => toast.error(Object.values(errs)[0] ?? 'Revisa los campos'),
        });
    };

    const reglas = (
        <div className="flex flex-col gap-5">
            <Panel titulo="Reglas de pedido" descripcion="Se aplican en el menú de pedido.">
                <div className="flex flex-col gap-4">
                    <Campo
                        etiqueta="Pedido mínimo"
                        inputMode="numeric"
                        sufijo="COP"
                        value={conMiles(data.config.pedido_minimo)}
                        onChange={(e) => conf('pedido_minimo', digitos(e.target.value))}
                        error={err['config.pedido_minimo']}
                    />
                    <div className="flex flex-col gap-4 rounded-[18px] bg-amarillo-suave p-4">
                        <FilaToggle titulo="Meta de regalo 🎁" descripcion="Muestra la barra de progreso en el carrito">
                            <Toggle checked={data.config.meta_regalo_activa} onChange={(v) => conf('meta_regalo_activa', v)} label="Meta de regalo" />
                        </FilaToggle>
                        <div className={cn('grid grid-cols-2 gap-3', !data.config.meta_regalo_activa && 'pointer-events-none opacity-50')}>
                            <Campo
                                etiqueta="Desde"
                                inputMode="numeric"
                                sufijo="COP"
                                value={conMiles(data.config.meta_regalo_desde)}
                                onChange={(e) => conf('meta_regalo_desde', digitos(e.target.value))}
                            />
                            <Campo
                                etiqueta="Regalo"
                                value={data.config.meta_regalo_texto}
                                onChange={(e) => conf('meta_regalo_texto', e.target.value)}
                                error={err['config.meta_regalo_texto']}
                            />
                        </div>
                    </div>
                    <FilaToggle titulo="Sugerencias “Va perfecto con”" descripcion="En la ficha de producto">
                        <Toggle checked={data.config.sugerencias_producto} onChange={(v) => conf('sugerencias_producto', v)} />
                    </FilaToggle>
                    <FilaToggle titulo="“¿Le sumas algo?” en carrito" descripcion="Productos de mayor margen primero">
                        <Toggle checked={data.config.sugerencias_carrito} onChange={(v) => conf('sugerencias_carrito', v)} />
                    </FilaToggle>
                    <FilaToggle
                        titulo="Cupón al confirmar pedido"
                        descripcion={
                            data.config.cupon_confirmacion_codigo
                                ? `Código ${data.config.cupon_confirmacion_codigo} · -${cupones.find((c) => c.codigo === data.config.cupon_confirmacion_codigo)?.porcentaje ?? '?'}%`
                                : 'Elige un cupón activo'
                        }
                    >
                        <Toggle checked={data.config.cupon_confirmacion_activo} onChange={(v) => conf('cupon_confirmacion_activo', v)} />
                    </FilaToggle>
                    {data.config.cupon_confirmacion_activo && (
                        <CampoSelector
                            value={data.config.cupon_confirmacion_codigo ?? ''}
                            onChange={(e) => conf('cupon_confirmacion_codigo', e.target.value)}
                            aria-label="Cupón a mostrar"
                        >
                            <option value="">Elige un cupón</option>
                            {cupones.map((c) => (
                                <option key={c.codigo} value={c.codigo}>
                                    {c.codigo} · -{c.porcentaje}%
                                </option>
                            ))}
                        </CampoSelector>
                    )}
                    <Link href="/admin/promociones" className="font-display text-[13px] font-bold text-rosa">
                        Administrar cupones →
                    </Link>
                </div>
            </Panel>

            <Panel titulo="Métodos de pago">
                <div className="flex flex-col gap-4">
                    <FilaToggle titulo="Pago en caja al recoger">
                        <Toggle checked={data.config.pago_caja} onChange={(v) => conf('pago_caja', v)} />
                    </FilaToggle>
                    <FilaToggle titulo="Transferencia bancaria">
                        <Toggle checked={data.config.pago_transferencia} onChange={(v) => conf('pago_transferencia', v)} />
                    </FilaToggle>
                    <FilaToggle titulo="Nequi / Daviplata">
                        <Toggle checked={data.config.pago_nequi} onChange={(v) => conf('pago_nequi', v)} />
                    </FilaToggle>
                    {err['config.pago_caja'] && <p className="text-xs text-rosa">{err['config.pago_caja']}</p>}
                </div>
            </Panel>
        </div>
    );

    const apariencia = (
        <Panel titulo="Apariencia del menú">
            <div className="flex flex-wrap items-center gap-3.5">
                <Logo className="w-16" />
                {['bg-turquesa', 'bg-rosa', 'bg-amarillo', 'bg-hueso border border-tinta/10', 'bg-tinta'].map((c) => (
                    <span key={c} className={cn('size-8 rounded-full', c)} />
                ))}
            </div>
            <p className="mt-4 text-[13px] text-tinta/60">Colores y tipografía vienen del sistema de marca 2026 y no se editan aquí.</p>
        </Panel>
    );

    return (
        <AppLayout>
            <Head title="Configuración" />
            <form onSubmit={guardar} className="flex flex-col gap-6">
                <PageHeader
                    titulo="Configuración"
                    descripcion="Datos del negocio, sedes, reglas de pedido y apariencia del menú."
                    acciones={
                        <PillButton type="submit" tamano="lg" flecha disabled={form.processing || !form.isDirty}>
                            {form.processing ? 'Guardando…' : 'Guardar cambios'}
                        </PillButton>
                    }
                />

                <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-tinta/8 bg-white p-1.5 scrollbar-none">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={cn(
                                'font-display shrink-0 rounded-full px-[18px] py-2.5 text-sm font-bold whitespace-nowrap transition-colors',
                                tab === t.id ? 'bg-tinta text-hueso' : 'text-tinta hover:bg-tinta/5',
                            )}
                        >
                            {t.titulo}
                        </button>
                    ))}
                </div>

                {tab === 'negocio' && (
                    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                        <Panel titulo="Datos del negocio">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Campo
                                    etiqueta="Nombre del negocio"
                                    value={data.config.negocio_nombre}
                                    onChange={(e) => conf('negocio_nombre', e.target.value)}
                                    error={err['config.negocio_nombre']}
                                />
                                <Campo
                                    etiqueta="Eslogan"
                                    value={data.config.negocio_eslogan ?? ''}
                                    onChange={(e) => conf('negocio_eslogan', e.target.value)}
                                />
                            </div>
                            <h3 className="font-display mt-6 mb-3 text-base font-bold">Redes sociales</h3>
                            <div className="grid gap-4 md:grid-cols-3">
                                <Campo
                                    etiqueta="Instagram"
                                    type="url"
                                    placeholder="https://www.instagram.com/…"
                                    value={data.config.negocio_instagram ?? ''}
                                    onChange={(e) => conf('negocio_instagram', e.target.value)}
                                    error={err['config.negocio_instagram']}
                                />
                                <Campo
                                    etiqueta="Facebook"
                                    type="url"
                                    placeholder="https://www.facebook.com/…"
                                    value={data.config.negocio_facebook ?? ''}
                                    onChange={(e) => conf('negocio_facebook', e.target.value)}
                                    error={err['config.negocio_facebook']}
                                />
                                <Campo
                                    etiqueta="TikTok"
                                    type="url"
                                    placeholder="https://www.tiktok.com/@…"
                                    value={data.config.negocio_tiktok ?? ''}
                                    onChange={(e) => conf('negocio_tiktok', e.target.value)}
                                    error={err['config.negocio_tiktok']}
                                />
                            </div>
                            <p className="mt-3 text-xs text-tinta/55">
                                Se muestran en el footer del menú y en la página de enlaces.{' '}
                                <a href="/links" target="_blank" rel="noopener" className="font-semibold text-rosa">
                                    Ver /links ↗
                                </a>{' '}
                                · úsala como enlace en la bio de Instagram y TikTok.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-4 border-t border-tinta/6 pt-5 text-sm">
                                <Link href="/settings/profile" className="font-display font-bold text-rosa">
                                    Mi perfil →
                                </Link>
                                <Link href="/settings/password" className="font-display font-bold text-rosa">
                                    Contraseña →
                                </Link>
                                <Link href="/settings/two-factor" className="font-display font-bold text-rosa">
                                    Verificación en dos pasos →
                                </Link>
                            </div>
                        </Panel>
                        {apariencia}
                    </div>
                )}

                {tab === 'sedes' && (
                    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                        <div className="flex flex-col gap-5">
                            {data.sedes.map((s, i) => (
                                <Panel
                                    key={s.id}
                                    titulo={`Sede ${s.nombre}`}
                                    descripcion={
                                        <span className="flex items-center gap-1.5">
                                            <span className={cn('size-2 rounded-full', s.recibiendo_pedidos ? 'bg-turquesa' : 'bg-tinta/40')} />
                                            {s.recibiendo_pedidos ? 'Abierta · recibiendo pedidos' : 'Pedidos en pausa'}
                                            {!s.en_menu && ' · oculta del menú'}
                                        </span>
                                    }
                                    accion={
                                        <div className="flex flex-col items-end gap-2 text-xs font-medium text-tinta/60">
                                            <label className="flex items-center gap-2">
                                                Recibe pedidos
                                                <Toggle checked={s.recibiendo_pedidos} onChange={(v) => sede(i, { recibiendo_pedidos: v })} />
                                            </label>
                                            <label className="flex items-center gap-2">
                                                Visible en el menú
                                                <Toggle checked={s.en_menu} onChange={(v) => sede(i, { en_menu: v })} />
                                            </label>
                                        </div>
                                    }
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Campo
                                            etiqueta="Nombre"
                                            value={s.nombre}
                                            onChange={(e) => sede(i, { nombre: e.target.value })}
                                            error={err[`sedes.${i}.nombre`]}
                                        />
                                        <Campo etiqueta="Dirección" value={s.direccion} onChange={(e) => sede(i, { direccion: e.target.value })} />
                                        <Campo
                                            etiqueta="WhatsApp de pedidos"
                                            inputMode="tel"
                                            value={s.whatsapp}
                                            onChange={(e) => sede(i, { whatsapp: e.target.value })}
                                        />
                                        <Campo
                                            etiqueta="Enlace de Google Maps"
                                            type="url"
                                            placeholder="https://maps.app.goo.gl/…"
                                            value={s.maps_url}
                                            onChange={(e) => sede(i, { maps_url: e.target.value })}
                                            error={err[`sedes.${i}.maps_url`]}
                                        />
                                        <Campo
                                            etiqueta="Tiempo de preparación"
                                            inputMode="numeric"
                                            sufijo="min"
                                            value={String(s.tiempo_preparacion)}
                                            onChange={(e) => sede(i, { tiempo_preparacion: digitos(e.target.value) })}
                                            error={err[`sedes.${i}.tiempo_preparacion`]}
                                        />
                                    </div>
                                    <div className="mt-4 divide-y divide-tinta/6 rounded-[18px] border border-tinta/8 bg-hueso">
                                        {s.horarios.map((h, k) => (
                                            <div key={k} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                                <span className="font-display text-sm font-bold">{h.dias}</span>
                                                <span className="flex items-center gap-2 text-[15px] font-medium">
                                                    <input
                                                        type="time"
                                                        value={h.abre}
                                                        onChange={(e) => horario(i, k, { abre: e.target.value })}
                                                        className="rounded-lg bg-transparent px-1 outline-none focus:bg-white"
                                                        aria-label={`${h.dias} abre`}
                                                        title={hora12(h.abre)}
                                                    />
                                                    –
                                                    <input
                                                        type="time"
                                                        value={h.cierra}
                                                        onChange={(e) => horario(i, k, { cierra: e.target.value })}
                                                        className="rounded-lg bg-transparent px-1 outline-none focus:bg-white"
                                                        aria-label={`${h.dias} cierra`}
                                                        title={hora12(h.cierra)}
                                                    />
                                                    <Toggle checked={h.activo} onChange={(v) => horario(i, k, { activo: v })} label={`${h.dias} abierto`} />
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Panel>
                            ))}
                        </div>
                        {reglas}
                    </div>
                )}

                {tab === 'pedidos' && <div className="max-w-[640px]">{reglas}</div>}

                {tab === 'apariencia' && <div className="max-w-[640px]">{apariencia}</div>}
            </form>
        </AppLayout>
    );
}
