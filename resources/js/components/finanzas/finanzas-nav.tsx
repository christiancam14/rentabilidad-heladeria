import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';

const items = [
    { title: 'Consolidado', href: '/finanzas/consolidado' },
    { title: 'Ventas', href: '/finanzas/ventas' },
    { title: 'Compras', href: '/finanzas/compras' },
    { title: 'Nómina', href: '/finanzas/nomina' },
    { title: 'Gastos fijos', href: '/finanzas/gastos-fijos' },
    { title: 'Tarjeta BBVA', href: '/finanzas/tarjeta-bbva' },
];

interface Props {
    active: string;
    periodo: { anio: number; mes: number };
}

export default function FinanzasNav({ active, periodo }: Props) {
    const qs = `?anio=${periodo.anio}&mes=${periodo.mes}`;

    return (
        <nav className="flex w-fit max-w-full flex-wrap gap-1 rounded-full border border-tinta/8 bg-white p-1.5">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={`${item.href}${qs}`}
                    className={cn(
                        'font-display rounded-full px-4 py-2 text-sm font-bold transition-colors',
                        active === item.href
                            ? 'bg-tinta text-hueso'
                            : 'text-tinta hover:bg-tinta/5',
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    );
}
