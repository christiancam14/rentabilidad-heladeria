import { cn } from '@/lib/utils';

export const FONDOS_FOTO: Record<string, string> = {
    turquesa: 'bg-turquesa-suave',
    rosa: 'bg-rosa-suave',
    amarillo: 'bg-amarillo-suave',
    blanco: 'bg-white',
};

interface ProductoFotoProps {
    src?: string | null;
    color?: string | null;
    alt?: string;
    className?: string;
}

/** Foto PNG/WebP sin fondo sobre un color pastel de la marca. */
export function ProductoFoto({
    src,
    color,
    alt = '',
    className,
}: ProductoFotoProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden',
                FONDOS_FOTO[color ?? 'turquesa'] ?? FONDOS_FOTO.turquesa,
                className,
            )}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    className="absolute inset-0 size-full object-contain p-[6%]"
                />
            ) : (
                <span
                    className="absolute inset-0 grid place-items-center text-3xl opacity-40"
                    aria-hidden
                >
                    🍨
                </span>
            )}
        </div>
    );
}
