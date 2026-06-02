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
        <nav className="flex flex-wrap gap-2 border-b pb-3">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={`${item.href}${qs}`}
                    className={cn(
                        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        active === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80',
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    );
}
