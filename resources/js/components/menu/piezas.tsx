import { Check, Minus, Plus } from 'lucide-react';
import { type ReactNode } from 'react';

import { ProductoFoto } from '@/components/brand/producto-foto';
import { formatPrice } from '@/lib/format-price';
import { ETIQUETAS } from '@/lib/menu';
import { cn } from '@/lib/utils';
import { type MenuProducto } from '@/types/menu';

/** Pedido / Stepper — vacío = botón +; con cantidad = − n + en rosa. */
export function Stepper({
    cantidad,
    onMas,
    onMenos,
    tamano = 'md',
    className,
    etiqueta,
}: {
    cantidad: number;
    onMas: () => void;
    onMenos?: () => void;
    tamano?: 'sm' | 'md';
    className?: string;
    etiqueta?: string;
}) {
    const alto = tamano === 'sm' ? 'h-8' : 'h-10';

    if (cantidad <= 0 || !onMenos) {
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onMas();
                }}
                aria-label={etiqueta ?? 'Agregar'}
                className={cn(
                    'grid shrink-0 place-items-center rounded-full bg-tinta text-white transition-transform active:scale-90',
                    alto,
                    tamano === 'sm' ? 'w-8' : 'w-10',
                    className,
                )}
            >
                <Plus
                    className={tamano === 'sm' ? 'size-4' : 'size-5'}
                    strokeWidth={3}
                />
            </button>
        );
    }

    return (
        <div
            className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full bg-rosa px-2 text-white',
                alto,
                className,
            )}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                type="button"
                onClick={onMenos}
                aria-label="Quitar uno"
                className="grid size-6 place-items-center active:scale-90"
            >
                <Minus className="size-[18px]" strokeWidth={3} />
            </button>
            <span className="min-w-3 text-center font-display text-[17px] font-bold tabular-nums">
                {cantidad}
            </span>
            <button
                type="button"
                onClick={onMas}
                aria-label="Agregar uno"
                className="grid size-6 place-items-center active:scale-90"
            >
                <Plus className="size-[18px]" strokeWidth={3} />
            </button>
        </div>
    );
}

export function EtiquetaBadge({
    etiqueta,
    className,
}: {
    etiqueta: MenuProducto['etiqueta'];
    className?: string;
}) {
    if (!etiqueta || !ETIQUETAS[etiqueta]) return null;
    const e = ETIQUETAS[etiqueta];

    return (
        <span
            className={cn(
                'inline-flex w-fit rounded-full px-2.5 py-[5px] text-meta',
                e.clase,
                className,
            )}
        >
            {e.texto}
        </span>
    );
}

/** Pedido / Opción — radio (elige una) o check (varias), siempre con el precio extra visible. */
export function Opcion({
    tipo,
    activo,
    titulo,
    precio,
    onClick,
    disabled,
}: {
    tipo: 'radio' | 'check';
    activo: boolean;
    titulo: ReactNode;
    precio?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role={tipo === 'radio' ? 'radio' : 'checkbox'}
            aria-checked={activo}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'flex min-h-14 w-full items-center gap-3.5 rounded-[18px] px-4 py-3 text-left transition-colors disabled:opacity-40',
                activo
                    ? 'border-2 border-rosa bg-white px-[15px]'
                    : 'border border-tinta/12 bg-hueso hover:border-tinta/30',
            )}
        >
            {tipo === 'radio' ? (
                <span
                    className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-full',
                        activo ? 'bg-rosa' : 'border-[1.5px] border-tinta/35',
                    )}
                >
                    {activo && (
                        <span className="size-2.5 rounded-full bg-white" />
                    )}
                </span>
            ) : (
                <span
                    className={cn(
                        'grid size-6 shrink-0 place-items-center rounded-[7px]',
                        activo
                            ? 'bg-rosa text-white'
                            : 'border-[1.5px] border-tinta/35',
                    )}
                >
                    {activo && <Check className="size-4" strokeWidth={3} />}
                </span>
            )}
            <span className="flex-1 font-display text-base font-bold tracking-[-0.02em] text-tinta">
                {titulo}
            </span>
            {precio !== undefined && (
                <span className="text-sm font-medium whitespace-nowrap text-tinta/65">
                    {precio}
                </span>
            )}
        </button>
    );
}

export function precioExtra(valor: number): string {
    if (valor === 0) return 'Incluido';
    return `${valor > 0 ? '+' : '–'} ${formatPrice(Math.abs(valor))}`;
}

/** Pedido / Meta de regalo — incentivo para subir el ticket. */
export function MetaRegalo({
    subtotal,
    meta,
}: {
    subtotal: number;
    meta: { desde: number; texto: string };
}) {
    const falta = Math.max(0, meta.desde - subtotal);
    const avance = Math.min(100, (subtotal / meta.desde) * 100);

    return (
        <div
            className={cn(
                'flex flex-col gap-2.5 rounded-[18px] px-4 py-3.5',
                falta ? 'bg-amarillo-suave' : 'bg-turquesa-suave',
            )}
        >
            <p className="font-display text-[15px] leading-[1.15] font-bold tracking-[-0.02em] text-tinta">
                {falta
                    ? `¡Ya casi! Te faltan ${formatPrice(falta)} para ${meta.texto.toLowerCase()} 🎁`
                    : `¡Lo lograste! Tu pedido incluye ${meta.texto.toLowerCase()} 🎁`}
            </p>
            <div className="h-2 overflow-hidden rounded bg-white">
                <div
                    className={cn(
                        'h-full rounded transition-[width] duration-500',
                        falta ? 'bg-rosa' : 'bg-turquesa',
                    )}
                    style={{ width: `${avance}%` }}
                />
            </div>
        </div>
    );
}

/** Pedido / Fila producto — nombre, 2 líneas, precio y + sobre la foto. */
export function FilaProducto({
    producto,
    cantidad,
    onAbrir,
    onMas,
    onMenos,
}: {
    producto: MenuProducto;
    cantidad: number;
    onAbrir: () => void;
    onMas: () => void;
    onMenos: () => void;
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onAbrir}
            onKeyDown={(e) => e.key === 'Enter' && onAbrir()}
            className={cn(
                'flex cursor-pointer items-center gap-3.5 border-b border-tinta/8 py-4 text-left outline-none focus-visible:bg-tinta/[0.03]',
                producto.agotado && 'cursor-default opacity-55',
            )}
        >
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                <EtiquetaBadge
                    etiqueta={
                        producto.etiqueta === 'combo' ? null : producto.etiqueta
                    }
                />
                <p className="font-display text-lg leading-[1.05] font-bold tracking-[-0.02em] text-tinta">
                    {producto.nombre}
                </p>
                {producto.descripcion && (
                    <p className="line-clamp-2 text-[13px] leading-[1.45] font-medium text-tinta/65">
                        {producto.descripcion}
                    </p>
                )}
                <p className="font-display text-[17px] font-bold tracking-[-0.02em] text-tinta">
                    {producto.agotado
                        ? 'Agotado por hoy'
                        : formatPrice(producto.precio)}
                    {!producto.agotado && producto.precio_anterior ? (
                        <span className="ml-2 text-sm font-medium text-tinta/40 line-through">
                            {formatPrice(producto.precio_anterior)}
                        </span>
                    ) : null}
                </p>
            </div>
            <div className="relative shrink-0">
                <ProductoFoto
                    src={producto.imagen_url}
                    color={producto.color}
                    alt={producto.nombre}
                    className="size-[112px] rounded-[22px]"
                />
                {!producto.agotado && (
                    <div className="absolute -right-1.5 -bottom-1.5">
                        <Stepper
                            cantidad={cantidad}
                            onMas={onMas}
                            onMenos={onMenos}
                            etiqueta={`Agregar ${producto.nombre}`}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

/** Variante en tarjeta de la fila de producto para tablet y escritorio. */
export function TarjetaProducto({
    producto,
    cantidad,
    onAbrir,
    onMas,
    onMenos,
}: {
    producto: MenuProducto;
    cantidad: number;
    onAbrir: () => void;
    onMas: () => void;
    onMenos: () => void;
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onAbrir}
            onKeyDown={(e) => e.key === 'Enter' && onAbrir()}
            className={cn(
                'group flex cursor-pointer flex-col rounded-[24px] border border-tinta/8 bg-white p-3 text-left transition-[transform,box-shadow] outline-none hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(11,46,54,0.35)] focus-visible:ring-2 focus-visible:ring-turquesa',
                producto.agotado &&
                    'cursor-default opacity-55 hover:translate-y-0 hover:shadow-none',
            )}
        >
            <div className="relative">
                <ProductoFoto
                    src={producto.imagen_url}
                    color={producto.color}
                    alt={producto.nombre}
                    className="aspect-[4/3] w-full rounded-[18px] [&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-105"
                />
                <EtiquetaBadge
                    etiqueta={
                        producto.etiqueta === 'combo' ? null : producto.etiqueta
                    }
                    className="absolute top-3 left-3"
                />
                {!producto.agotado && (
                    <div className="absolute right-3 bottom-3">
                        <Stepper
                            cantidad={cantidad}
                            onMas={onMas}
                            onMenos={onMenos}
                            etiqueta={`Agregar ${producto.nombre}`}
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-1 px-1.5 pt-3 pb-1">
                <p className="font-display text-lg leading-[1.05] font-bold tracking-[-0.02em] text-tinta">
                    {producto.nombre}
                </p>
                {producto.descripcion && (
                    <p className="line-clamp-2 text-[13px] leading-[1.45] font-medium text-tinta/65">
                        {producto.descripcion}
                    </p>
                )}
                <p className="mt-auto pt-1.5 font-display text-[17px] font-bold tracking-[-0.02em] text-tinta">
                    {producto.agotado
                        ? 'Agotado por hoy'
                        : formatPrice(producto.precio)}
                    {!producto.agotado && producto.precio_anterior ? (
                        <span className="ml-2 text-sm font-medium text-tinta/40 line-through">
                            {formatPrice(producto.precio_anterior)}
                        </span>
                    ) : null}
                </p>
            </div>
        </div>
    );
}

/** Pedido / Mini sugerencia — venta cruzada en carrusel horizontal. */
export function MiniSugerencia({
    producto,
    onAgregar,
    onAbrir,
    prefijoPrecio = '',
    ancho = 'w-[140px]',
}: {
    producto: MenuProducto;
    onAgregar: () => void;
    onAbrir: () => void;
    prefijoPrecio?: string;
    ancho?: string;
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onAbrir}
            onKeyDown={(e) => e.key === 'Enter' && onAbrir()}
            className={cn(
                'flex shrink-0 cursor-pointer snap-start flex-col gap-2 rounded-[20px] border border-tinta/8 bg-white p-2.5 text-left',
                ancho,
            )}
        >
            <ProductoFoto
                src={producto.imagen_url}
                color={producto.color}
                alt={producto.nombre}
                className="aspect-[4/3] w-full rounded-[14px]"
            />
            <p className="line-clamp-2 min-h-[2.1em] font-display text-sm leading-[1.05] font-bold tracking-[-0.02em] text-tinta">
                {producto.nombre}
            </p>
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-tinta">
                    {prefijoPrecio}
                    {formatPrice(producto.precio)}
                </span>
                <Stepper
                    cantidad={0}
                    onMas={onAgregar}
                    tamano="sm"
                    etiqueta={`Agregar ${producto.nombre}`}
                />
            </div>
        </div>
    );
}

/** Pedido / CTA — botón principal siempre visible con el total actualizado. */
export function Cta({
    accion,
    total,
    color = 'rosa',
    onClick,
    disabled,
    className,
    type = 'button',
}: {
    accion: ReactNode;
    total?: ReactNode;
    color?: 'rosa' | 'tinta';
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit';
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'flex h-[60px] w-full items-center justify-between gap-3 rounded-full px-6 font-display text-[17px] font-bold tracking-[-0.02em] transition-[transform,opacity] active:scale-[0.98] disabled:opacity-50',
                color === 'rosa' ? 'bg-rosa text-white' : 'bg-tinta text-hueso',
                className,
            )}
        >
            <span className="truncate">{accion}</span>
            {total !== undefined && (
                <span className="shrink-0 tabular-nums">{total}</span>
            )}
        </button>
    );
}
