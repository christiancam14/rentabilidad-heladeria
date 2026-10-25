import { ArrowLeft } from 'lucide-react';
import {
    type ComponentProps,
    type FormEvent,
    useEffect,
    useState,
} from 'react';

import { ProductoFoto } from '@/components/brand/producto-foto';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils';
import {
    type LineaCarrito,
    type MenuProducto,
    type MenuReglas,
    type MenuSede,
} from '@/types/menu';

import { Cta, MetaRegalo, MiniSugerencia, Opcion, Stepper } from './piezas';

export interface DatosCliente {
    nombre: string;
    telefono: string;
    metodo_pago: string;
    notas: string;
}

interface CarritoProps {
    sede: MenuSede;
    lineas: LineaCarrito[];
    productos: MenuProducto[];
    sugerencias: MenuProducto[];
    reglas: MenuReglas;
    cliente: DatosCliente;
    errores: Record<string, string>;
    enviando: boolean;
    onCliente: (c: DatosCliente) => void;
    onCantidad: (key: string, cantidad: number) => void;
    onVolver: () => void;
    onAbrir: (p: MenuProducto) => void;
    onAgregarRapido: (p: MenuProducto) => void;
    onEnviar: (cupon: string | null) => void;
}

/** 3 · Carrito — revisión, venta cruzada, pago y envío del pedido. */
export function Carrito({
    sede,
    lineas,
    productos,
    sugerencias,
    reglas,
    cliente,
    errores,
    enviando,
    onCliente,
    onCantidad,
    onVolver,
    onAbrir,
    onAgregarRapido,
    onEnviar,
}: CarritoProps) {
    const [cuponTexto, setCuponTexto] = useState('');
    const [cupon, setCupon] = useState<{
        codigo: string;
        porcentaje: number;
    } | null>(null);
    const [cuponError, setCuponError] = useState<string | null>(null);
    const [mostrarCupon, setMostrarCupon] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
    const subtotal = lineas.reduce(
        (s, l) => s + l.precio_unitario * l.cantidad,
        0,
    );
    const descuento = cupon
        ? Math.round((subtotal * cupon.porcentaje) / 100)
        : 0;
    const total = subtotal - descuento;
    const faltaMinimo = Math.max(0, reglas.pedido_minimo - subtotal);
    const meta = reglas.meta_regalo;

    const validarCupon = async () => {
        const codigo = cuponTexto.trim();
        if (!codigo) return;
        setCuponError(null);
        try {
            const res = await fetch(`/cupon/${encodeURIComponent(codigo)}`, {
                headers: { Accept: 'application/json' },
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message ?? 'Cupón no válido');
            setCupon(json);
        } catch (err) {
            setCupon(null);
            setCuponError(
                err instanceof Error ? err.message : 'Cupón no válido',
            );
        }
    };

    const enviar = (e: FormEvent) => {
        e.preventDefault();
        onEnviar(cupon?.codigo ?? null);
    };

    const primerError = Object.entries(errores).find(
        ([k]) => k.startsWith('items') || k === 'sede_id',
    )?.[1];

    const resumen = (
        <>
            <dl className="flex flex-col gap-2.5 text-[15px]">
                <div className="flex justify-between font-medium text-tinta/80">
                    <dt>
                        Subtotal · {unidades}{' '}
                        {unidades === 1 ? 'producto' : 'productos'}
                    </dt>
                    <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                {meta && (
                    <div className="flex justify-between font-medium text-tinta/80">
                        <dt>{meta.texto}</dt>
                        <dd>
                            {subtotal >= meta.desde
                                ? '¡Incluido! 🎁'
                                : `Te faltan ${formatPrice(meta.desde - subtotal)}`}
                        </dd>
                    </div>
                )}
                {descuento > 0 && (
                    <div className="flex justify-between font-medium text-tinta/80">
                        <dt>Cupón {cupon?.codigo}</dt>
                        <dd className="tabular-nums">
                            -{formatPrice(descuento)}
                        </dd>
                    </div>
                )}
                <div className="flex justify-between font-display text-xl font-bold tracking-[-0.02em]">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatPrice(total)}</dd>
                </div>
            </dl>
        </>
    );

    const aviso =
        primerError || faltaMinimo > 0 || !sede.recibiendo_pedidos
            ? !sede.recibiendo_pedidos
                ? `${sede.nombre} no está recibiendo pedidos en este momento.`
                : faltaMinimo > 0
                  ? `El pedido mínimo es de ${formatPrice(reglas.pedido_minimo)} · te faltan ${formatPrice(faltaMinimo)}`
                  : primerError
            : null;

    const cta = (corto = false) => (
        <>
            {aviso && (
                <p className="mb-2 text-center text-xs font-semibold text-rosa">
                    {aviso}
                </p>
            )}
            <Cta
                type="submit"
                color="tinta"
                accion={
                    enviando
                        ? 'Enviando…'
                        : corto
                          ? 'Enviar por WhatsApp'
                          : 'Enviar pedido por WhatsApp'
                }
                total={formatPrice(total)}
                disabled={
                    enviando || faltaMinimo > 0 || !sede.recibiendo_pedidos
                }
            />
            <p className="mt-2 text-center text-meta text-[10px] text-tinta/55">
                Te confirmamos por WhatsApp en minutos
            </p>
        </>
    );

    return (
        <form
            onSubmit={enviar}
            className="mx-auto flex min-h-svh w-full max-w-[1120px] flex-col"
        >
            <div className="flex-1 px-4 pt-8 pb-44 md:px-8 md:pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-x-12 lg:pb-16">
                <div className="min-w-0 md:mx-auto md:max-w-[620px] lg:mx-0 lg:max-w-none">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onVolver}
                            aria-label="Volver al menú"
                            className="-ml-2 flex h-10 items-center gap-2 rounded-full pr-3 pl-2 hover:bg-tinta/5"
                        >
                            <ArrowLeft className="size-6" strokeWidth={2.5} />
                            <span className="hidden font-display text-sm font-bold md:inline">
                                Seguir pidiendo
                            </span>
                        </button>
                        <span className="text-meta text-tinta">
                            {sede.nombre} · listo en {sede.tiempo_preparacion}{' '}
                            min
                        </span>
                    </div>

                    <h1 className="mt-4 font-display text-[44px] leading-[0.9] font-extrabold tracking-[-0.04em] text-tinta md:text-[56px]">
                        Tu{' '}
                        <span className="font-serif font-normal tracking-normal text-rosa italic">
                            pedido.
                        </span>
                    </h1>

                    {meta && lineas.length > 0 && (
                        <div className="mt-6 lg:hidden">
                            <MetaRegalo subtotal={subtotal} meta={meta} />
                        </div>
                    )}

                    {lineas.length === 0 ? (
                        <div className="mt-10 flex flex-col items-center gap-3 text-center">
                            <span className="text-5xl">🍦</span>
                            <p className="font-display text-xl font-bold">
                                Tu pedido está vacío
                            </p>
                            <button
                                type="button"
                                onClick={onVolver}
                                className="text-meta text-rosa"
                            >
                                Ver el menú
                            </button>
                        </div>
                    ) : (
                        <div className="mt-5">
                            {lineas.map((l) => {
                                const p = productos.find(
                                    (x) => x.id === l.producto_id,
                                );
                                return (
                                    <div
                                        key={l.key}
                                        className="flex items-center gap-3 border-b border-tinta/8 py-3.5 md:gap-4"
                                    >
                                        <ProductoFoto
                                            src={p?.imagen_url}
                                            color={p?.color}
                                            className="size-14 shrink-0 rounded-[14px] md:size-[72px] md:rounded-[18px]"
                                        />
                                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <p className="font-display text-base leading-[1.05] font-bold tracking-[-0.02em] md:text-lg">
                                                {l.nombre}
                                            </p>
                                            {l.detalle && (
                                                <p className="text-xs leading-[1.45] font-medium text-tinta/60 md:text-[13px]">
                                                    {l.detalle}
                                                </p>
                                            )}
                                            <p className="font-display text-[15px] font-bold">
                                                {formatPrice(
                                                    l.precio_unitario *
                                                        l.cantidad,
                                                )}
                                            </p>
                                        </div>
                                        <Stepper
                                            cantidad={l.cantidad}
                                            onMas={() =>
                                                onCantidad(
                                                    l.key,
                                                    l.cantidad + 1,
                                                )
                                            }
                                            onMenos={() =>
                                                onCantidad(
                                                    l.key,
                                                    l.cantidad - 1,
                                                )
                                            }
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {reglas.sugerencias_carrito &&
                        sugerencias.length > 0 &&
                        lineas.length > 0 && (
                            <section className="mt-7">
                                <h2 className="mb-3 font-display text-lg font-bold tracking-[-0.02em]">
                                    ¿Le sumas algo?
                                </h2>
                                <div className="-mx-4 scrollbar-none flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
                                    {sugerencias.map((s, i) => (
                                        <MiniSugerencia
                                            key={s.id}
                                            producto={s}
                                            prefijoPrecio="+ "
                                            ancho={cn(
                                                'w-[140px] md:w-auto',
                                                i >= 4 && 'md:hidden',
                                            )}
                                            onAbrir={() => onAbrir(s)}
                                            onAgregar={() => onAgregarRapido(s)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                    {lineas.length > 0 && (
                        <>
                            <div className="mt-7 grid gap-7 md:grid-cols-2 md:gap-6">
                                <section className="flex flex-col gap-2.5">
                                    <h2 className="font-display text-lg font-bold tracking-[-0.02em]">
                                        ¿A nombre de quién?
                                    </h2>
                                    <CampoMenu
                                        placeholder="Tu nombre"
                                        autoComplete="given-name"
                                        value={cliente.nombre}
                                        onChange={(v) =>
                                            onCliente({ ...cliente, nombre: v })
                                        }
                                        error={errores.cliente_nombre}
                                    />
                                    <CampoMenu
                                        placeholder="WhatsApp · 300 000 0000"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        value={cliente.telefono}
                                        onChange={(v) =>
                                            onCliente({
                                                ...cliente,
                                                telefono: v,
                                            })
                                        }
                                        error={errores.cliente_telefono}
                                    />
                                </section>

                                <section className="flex flex-col gap-2.5">
                                    <h2 className="font-display text-lg font-bold tracking-[-0.02em]">
                                        ¿Cómo pagas?
                                    </h2>
                                    {reglas.pagos.map((p) => (
                                        <Opcion
                                            key={p.key}
                                            tipo="radio"
                                            activo={
                                                cliente.metodo_pago === p.key
                                            }
                                            titulo={
                                                p.key === 'caja'
                                                    ? 'En caja al recoger'
                                                    : p.label
                                            }
                                            onClick={() =>
                                                onCliente({
                                                    ...cliente,
                                                    metodo_pago: p.key,
                                                })
                                            }
                                        />
                                    ))}
                                    {errores.metodo_pago && (
                                        <p className="text-xs font-medium text-rosa">
                                            {errores.metodo_pago}
                                        </p>
                                    )}
                                </section>
                            </div>

                            <div className="mt-5 flex flex-col gap-2.5">
                                <CampoMenu
                                    placeholder="✏️  Notas para la heladería (opcional)"
                                    value={cliente.notas}
                                    onChange={(v) =>
                                        onCliente({ ...cliente, notas: v })
                                    }
                                    error={errores.notas}
                                />

                                {cupon ? (
                                    <div className="flex items-center justify-between rounded-[18px] bg-turquesa-suave px-4 py-3">
                                        <span className="font-display text-[15px] font-bold">
                                            🎟️ {cupon.codigo} · -
                                            {cupon.porcentaje}%
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setCupon(null)}
                                            className="text-meta text-tinta/60"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                ) : mostrarCupon ? (
                                    <div className="flex gap-2">
                                        <CampoMenu
                                            placeholder="Código del cupón"
                                            value={cuponTexto}
                                            onChange={(v) =>
                                                setCuponTexto(v.toUpperCase())
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    validarCupon();
                                                }
                                            }}
                                            error={cuponError ?? errores.cupon}
                                            className="flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={validarCupon}
                                            className="h-[54px] rounded-[18px] bg-tinta px-5 font-display text-sm font-bold text-hueso"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setMostrarCupon(true)}
                                        className="self-start py-1 text-meta text-rosa"
                                    >
                                        ¿Tienes un cupón?
                                    </button>
                                )}
                            </div>

                            <div className="mt-6 lg:hidden">{resumen}</div>
                        </>
                    )}
                </div>

                {/* Escritorio: resumen y envío fijos a la derecha */}
                {lineas.length > 0 && (
                    <aside className="hidden lg:sticky lg:top-8 lg:mt-[108px] lg:block">
                        <div className="flex flex-col gap-5 rounded-[28px] border border-tinta/8 bg-white p-6">
                            {meta && (
                                <MetaRegalo subtotal={subtotal} meta={meta} />
                            )}
                            {resumen}
                            <div>{cta(true)}</div>
                        </div>
                    </aside>
                )}
            </div>

            {lineas.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t border-tinta/8 bg-white lg:hidden">
                    <div className="mx-auto w-full max-w-[620px] px-4 pt-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
                        {cta()}
                    </div>
                </div>
            )}
        </form>
    );
}

function CampoMenu({
    value,
    onChange,
    error,
    className,
    ...props
}: Omit<ComponentProps<'input'>, 'onChange'> & {
    value: string;
    onChange: (v: string) => void;
    error?: string | null;
}) {
    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    'h-[54px] w-full rounded-[18px] border bg-white px-[18px] text-[15px] font-medium text-tinta outline-none placeholder:text-tinta/45 focus:border-2 focus:border-turquesa focus:px-[17px]',
                    error
                        ? 'border-2 border-rosa px-[17px]'
                        : 'border-tinta/12',
                )}
                {...props}
            />
            {error && (
                <p className="px-1 text-xs font-medium text-rosa">{error}</p>
            )}
        </div>
    );
}
