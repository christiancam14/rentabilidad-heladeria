import { Head } from '@inertiajs/react';

import FinanzasNav from '@/components/finanzas/finanzas-nav';
import PeriodSelector from '@/components/finanzas/period-selector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatPrice, type FinanzasPeriodo } from '@/lib/format-price';
import { type BreadcrumbItem } from '@/types';

interface Consolidado {
    entradas: {
        ventas_por_sede: { sede_id: number; sede_nombre: string; total: number }[];
        total: number;
    };
    salidas: {
        compras: number;
        gastos_fijos_por_sede: { sede_id: number; sede_nombre: string; total: number }[];
        gastos_fijos_total: number;
        nomina: number;
        total: number;
    };
    ganancia: number;
}

interface Props {
    periodo: FinanzasPeriodo;
    consolidado: Consolidado;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Finanzas', href: '/finanzas/consolidado' },
    { title: 'Consolidado', href: '/finanzas/consolidado' },
];

export default function FinanzasConsolidado({ periodo, consolidado }: Props) {
    const { entradas, salidas, ganancia } = consolidado;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Consolidado - ${periodo.nombre_mes} ${periodo.anio}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Consolidado</h1>
                        <p className="text-muted-foreground text-sm">
                            Control manual — {periodo.nombre_mes} {periodo.anio}
                        </p>
                    </div>
                    <PeriodSelector periodo={periodo} basePath="/finanzas/consolidado" />
                </div>

                <FinanzasNav active="/finanzas/consolidado" periodo={periodo} />

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-green-700 dark:text-green-400">Entradas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {entradas.ventas_por_sede.map((v) => (
                                <div key={v.sede_id} className="flex justify-between text-sm">
                                    <span>Ventas {v.sede_nombre}</span>
                                    <span className="font-medium">{formatPrice(v.total)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Total entradas</span>
                                <span>{formatPrice(entradas.total)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-700 dark:text-red-400">Salidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Compras</span>
                                <span>{formatPrice(salidas.compras)}</span>
                            </div>
                            {salidas.gastos_fijos_por_sede.map((g) => (
                                <div key={g.sede_id} className="flex justify-between">
                                    <span>Gastos fijos {g.sede_nombre}</span>
                                    <span>{formatPrice(g.total)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between">
                                <span>Nómina</span>
                                <span>{formatPrice(salidas.nomina)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Total salidas</span>
                                <span>{formatPrice(salidas.total)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ganancia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p
                                className={`text-3xl font-bold ${ganancia >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
                            >
                                {formatPrice(ganancia)}
                            </p>
                            <p className="text-muted-foreground mt-2 text-xs">
                                Entradas − Salidas. Tarjeta BBVA no incluida (control aparte).
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
