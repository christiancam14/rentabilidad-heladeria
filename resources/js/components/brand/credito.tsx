import { cn } from '@/lib/utils';

/** Abre WhatsApp con un mensaje listo para pedir un menú similar. */
const CREDITO_URL = `https://wa.me/573186898839?text=${encodeURIComponent(
    'Hola Christian, vi el menú digital de A Tu Gusto y quiero uno para mi negocio.',
)}`;

export function Credito({
    className,
    claro = false,
}: {
    className?: string;
    claro?: boolean;
}) {
    return (
        <p
            className={cn(
                'text-xs font-medium',
                claro ? 'text-white/70' : 'text-tinta/45',
                className,
            )}
        >
            Diseño y desarrollo -{' '}
            <a
                href={CREDITO_URL}
                target="_blank"
                rel="noopener"
                className={cn(
                    'font-semibold underline-offset-2 hover:underline',
                    claro ? 'text-white' : 'text-rosa',
                )}
            >
                ChristianDev
            </a>
        </p>
    );
}
