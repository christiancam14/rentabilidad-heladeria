import { cn } from '@/lib/utils';

interface LogoProps {
    /** turquesa: sobre fondos claros · rosa: sobre fondo turquesa */
    variante?: 'turquesa' | 'rosa';
    className?: string;
}

export function Logo({ variante = 'turquesa', className }: LogoProps) {
    return (
        <img
            src={`/brand/logo-2026-${variante}.svg`}
            alt="Heladería A Tu Gusto"
            className={cn('block h-auto select-none', className)}
            draggable={false}
        />
    );
}
