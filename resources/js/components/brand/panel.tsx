import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PanelProps extends Omit<ComponentProps<'section'>, 'title'> {
    titulo?: ReactNode;
    descripcion?: ReactNode;
    accion?: ReactNode;
}

/** Tarjeta blanca de sección del panel administrativo. */
export function Panel({
    titulo,
    descripcion,
    accion,
    className,
    children,
    ...props
}: PanelProps) {
    return (
        <section
            className={cn(
                'rounded-[24px] border border-tinta/8 bg-white p-6',
                className,
            )}
            {...props}
        >
            {(titulo || accion) && (
                <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        {titulo && (
                            <h2 className="font-display text-xl font-bold text-tinta">
                                {titulo}
                            </h2>
                        )}
                        {descripcion && (
                            <p className="mt-0.5 text-[13px] text-tinta/60">
                                {descripcion}
                            </p>
                        )}
                    </div>
                    {accion}
                </header>
            )}
            {children}
        </section>
    );
}

interface PageHeaderProps {
    titulo: ReactNode;
    descripcion?: ReactNode;
    miga?: ReactNode;
    acciones?: ReactNode;
}

/** Encabezado de página: título grande Bricolage + subtítulo + acciones a la derecha. */
export function PageHeader({
    titulo,
    descripcion,
    miga,
    acciones,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {miga && <p className="mb-1 text-meta text-tinta/55">{miga}</p>}
                <h1 className="font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.04em] text-tinta md:text-[44px]">
                    {titulo}
                </h1>
                {descripcion && (
                    <p className="mt-1.5 text-[15px] text-tinta/65">
                        {descripcion}
                    </p>
                )}
            </div>
            {acciones && (
                <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                    {acciones}
                </div>
            )}
        </div>
    );
}

/** Fila etiqueta + interruptor (Disponibilidad, Métodos de pago…). */
export function FilaToggle({
    titulo,
    descripcion,
    children,
    className,
}: {
    titulo: ReactNode;
    descripcion?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn('flex items-center justify-between gap-4', className)}
        >
            <div className="min-w-0">
                <p className="text-[15px] font-medium text-tinta">{titulo}</p>
                {descripcion && (
                    <p className="text-xs text-tinta/55">{descripcion}</p>
                )}
            </div>
            {children}
        </div>
    );
}
