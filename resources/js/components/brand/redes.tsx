import { type SVGProps } from 'react';

import { cn } from '@/lib/utils';
import { type RedSocial } from '@/types/menu';

type IconoProps = SVGProps<SVGSVGElement>;

export function IconoInstagram(props: IconoProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
    );
}

export function IconoFacebook(props: IconoProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    );
}

export function IconoTiktok(props: IconoProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M16.6 2.5c.35 2.5 1.86 4.08 4.4 4.25v3.17a7.6 7.6 0 0 1-4.37-1.36v6.4a5.96 5.96 0 1 1-5.96-5.96c.33 0 .65.03.96.08v3.27a2.73 2.73 0 1 0 1.9 2.6V2.5h3.07z" />
        </svg>
    );
}

export function IconoWhatsapp(props: IconoProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
            <path
                d="M9 9.2c.2 1.9 2.3 4.6 4.8 5.3.6.2 1.3-.1 1.6-.7l.3-.6-1.9-.9-.7.8c-.9-.3-1.9-1.3-2.2-2.2l.8-.7-.9-1.9-.6.3c-.6.3-.9 1-.8 1.6z"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
}

export const REDES: Record<
    RedSocial,
    { nombre: string; Icono: (p: IconoProps) => React.JSX.Element }
> = {
    instagram: { nombre: 'Instagram', Icono: IconoInstagram },
    facebook: { nombre: 'Facebook', Icono: IconoFacebook },
    tiktok: { nombre: 'TikTok', Icono: IconoTiktok },
};

/** Fila de íconos circulares de redes sociales. */
export function RedesSociales({
    redes,
    className,
}: {
    redes: Partial<Record<RedSocial, string>>;
    className?: string;
}) {
    const entradas = (Object.keys(REDES) as RedSocial[]).filter(
        (r) => redes[r],
    );
    if (!entradas.length) return null;

    return (
        <div
            className={cn(
                'flex items-center justify-center gap-2.5',
                className,
            )}
        >
            {entradas.map((r) => {
                const { nombre, Icono } = REDES[r];
                return (
                    <a
                        key={r}
                        href={redes[r]}
                        target="_blank"
                        rel="noopener"
                        aria-label={`${nombre} de la heladería`}
                        className="grid size-11 place-items-center rounded-full bg-white text-tinta shadow-[0_6px_16px_-10px_rgba(11,46,54,0.5)] transition-transform hover:-translate-y-0.5 hover:text-rosa"
                    >
                        <Icono className="size-5" />
                    </a>
                );
            })}
        </div>
    );
}
