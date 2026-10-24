import { cn } from '@/lib/utils';

const ESTILOS = {
    disponible: { fondo: 'bg-turquesa-suave', punto: 'bg-turquesa', texto: 'Disponible' },
    agotado: { fondo: 'bg-rosa-suave/70', punto: 'bg-rosa', texto: 'Agotado' },
    oculto: { fondo: 'bg-tinta/5', punto: 'bg-tinta/40', texto: 'Oculto' },
    nuevo: { fondo: 'bg-amarillo-suave', punto: 'bg-amarillo', texto: 'Nuevo' },
} as const;

export type Estado = keyof typeof ESTILOS;

export function EstadoBadge({ estado, texto, className }: { estado: Estado; texto?: string; className?: string }) {
    const e = ESTILOS[estado];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full py-[5px] pr-3 pl-2.5 text-xs font-medium whitespace-nowrap text-tinta',
                e.fondo,
                className,
            )}
        >
            <span className={cn('size-[7px] rounded-full', e.punto)} />
            {texto ?? e.texto}
        </span>
    );
}
