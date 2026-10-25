import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

interface ChipProps extends ComponentProps<'button'> {
    activo?: boolean;
    emoji?: string | null;
    contador?: number;
}

/** Web / Chip categoría: píldora con emoji y contador; activa = tinta. */
export function Chip({
    activo,
    emoji,
    contador,
    className,
    children,
    ...props
}: ChipProps) {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex h-12 shrink-0 items-center gap-2 rounded-full border-[1.5px] px-5 font-display text-base font-bold whitespace-nowrap transition-colors',
                activo
                    ? 'border-tinta bg-tinta text-hueso'
                    : 'border-tinta/15 bg-white text-tinta hover:border-tinta/40',
                className,
            )}
            {...props}
        >
            {emoji && <span className="text-[17px]">{emoji}</span>}
            {children}
            {contador !== undefined && (
                <span
                    className={cn(
                        'font-sans text-sm font-semibold',
                        activo ? 'text-hueso/60' : 'text-tinta/45',
                    )}
                >
                    {contador}
                </span>
            )}
        </button>
    );
}

/** Web / Tag sabor: etiqueta seleccionable (rosa cuando está elegida). */
export function TagSabor({
    activo,
    className,
    children,
    ...props
}: ComponentProps<'button'> & { activo?: boolean }) {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex h-[43px] items-center rounded-full px-[18px] text-base font-medium whitespace-nowrap transition-colors disabled:opacity-40',
                activo
                    ? 'bg-rosa text-white'
                    : 'bg-white text-tinta hover:bg-tinta/5',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}
