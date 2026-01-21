import { Head, Link } from '@inertiajs/react';
import { Package, IceCream, AlertTriangle, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Producto {
    id: number;
    nombre: string;
    precio_venta_publico: number;
    costo_total: number;
    ganancia: number;
    porcentaje_rentabilidad: number;
}

interface Insumo {
    id: number;
    nombre: string;
    precio: number;
    unidad: string;
    productos_count: number;
}

interface Props {
    kpis: {
        total_productos: number;
        total_insumos: number;
        productos_incompletos: number;
        rentabilidad_promedio: number;
    };
    top_productos_rentabilidad: Producto[];
    top_productos_ganancia: Producto[];
    productos_requieren_atencion: {
        baja_rentabilidad: Producto[];
        sin_insumos: Array<{ id: number; nombre: string; precio_venta_publico: number }>;
        rentabilidad_negativa: Producto[];
    };
    estadisticas_financieras: {
        valor_total_inventario: number;
        ganancia_potencial_total: number;
        valor_venta_publico_total: number;
    };
    metricas_adicionales: {
        promedio_insumos_por_producto: number;
    };
    distribucion_rentabilidad: {
        alta: number;
        media: number;
        baja: number;
        negativa: number;
    };
    insumos_mas_utilizados: Insumo[];
}

// Función helper para formatear precios con separador de miles (punto)
const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return '$0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    if (isNaN(numPrice)) return '$0';
    const rounded = Math.round(numPrice);
    return `$${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

// Función helper para formatear porcentajes
const formatPercentage = (percentage: number | string | null | undefined): string => {
    if (percentage === null || percentage === undefined) return '0.00';
    const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : Number(percentage);
    if (isNaN(numPercentage)) return '0.00';
    return numPercentage.toFixed(2);
};

// Función helper para convertir texto a Camel Case
const toCamelCase = (text: string | null | undefined): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function Dashboard({
    kpis,
    top_productos_rentabilidad,
    top_productos_ganancia,
    productos_requieren_atencion,
    estadisticas_financieras,
    metricas_adicionales,
    distribucion_rentabilidad,
    insumos_mas_utilizados,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Resumen y analítica de tu heladería
                    </p>
                </div>

                {/* KPIs Principales */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                            <IceCream className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.total_productos}</div>
                            <p className="text-xs text-muted-foreground">
                                Productos registrados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Insumos</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.total_insumos}</div>
                            <p className="text-xs text-muted-foreground">
                                Insumos disponibles
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rentabilidad Promedio</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatPercentage(kpis.rentabilidad_promedio)}%</div>
                            <p className="text-xs text-muted-foreground">
                                Rentabilidad promedio general
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Productos Incompletos</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{kpis.productos_incompletos}</div>
                            <p className="text-xs text-muted-foreground">
                                Sin insumos configurados
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Top 5 Productos Más Rentables */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 5 Productos Más Rentables</CardTitle>
                            <CardDescription>
                                Por porcentaje de rentabilidad
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {top_productos_rentabilidad.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay productos registrados</p>
                            ) : (
                                <div className="space-y-4">
                                    {top_productos_rentabilidad.map((producto, index) => (
                                        <div key={producto.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/productos/${producto.id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {toCamelCase(producto.nombre)}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        Ganancia: {formatPrice(producto.ganancia)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={producto.porcentaje_rentabilidad >= 30 ? 'default' : 'outline'}
                                                className="font-semibold"
                                            >
                                                {formatPercentage(producto.porcentaje_rentabilidad)}%
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top 5 Productos por Ganancia */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 5 Productos por Ganancia</CardTitle>
                            <CardDescription>
                                Mayor ganancia absoluta
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {top_productos_ganancia.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay productos registrados</p>
                            ) : (
                                <div className="space-y-4">
                                    {top_productos_ganancia.map((producto, index) => (
                                        <div key={producto.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={`/productos/${producto.id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {toCamelCase(producto.nombre)}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        Rentabilidad: {formatPercentage(producto.porcentaje_rentabilidad)}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-green-600">
                                                    {formatPrice(producto.ganancia)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Distribución de Rentabilidad */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución de Rentabilidad</CardTitle>
                        <CardDescription>
                            Clasificación de productos por nivel de rentabilidad
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex flex-col items-center rounded-lg border p-4">
                                <div className="text-2xl font-bold text-green-600">{distribucion_rentabilidad.alta}</div>
                                <div className="text-sm text-muted-foreground">Alta (≥30%)</div>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border p-4">
                                <div className="text-2xl font-bold text-blue-600">{distribucion_rentabilidad.media}</div>
                                <div className="text-sm text-muted-foreground">Media (15-30%)</div>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border p-4">
                                <div className="text-2xl font-bold text-yellow-600">{distribucion_rentabilidad.baja}</div>
                                <div className="text-sm text-muted-foreground">Baja (&lt;15%)</div>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border p-4">
                                <div className="text-2xl font-bold text-red-600">{distribucion_rentabilidad.negativa}</div>
                                <div className="text-sm text-muted-foreground">Negativa</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Productos que Requieren Atención */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                Baja Rentabilidad
                            </CardTitle>
                            <CardDescription>
                                Productos con rentabilidad &lt;15%
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productos_requieren_atencion.baja_rentabilidad.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Ningún producto requiere atención</p>
                            ) : (
                                <div className="space-y-3">
                                    {productos_requieren_atencion.baja_rentabilidad.map((producto) => (
                                        <div key={producto.id} className="flex items-center justify-between border-b pb-2">
                                            <Link
                                                href={`/productos/${producto.id}`}
                                                className="text-sm font-medium hover:underline"
                                            >
                                                {toCamelCase(producto.nombre)}
                                            </Link>
                                            <Badge variant="outline" className="text-xs">
                                                {formatPercentage(producto.porcentaje_rentabilidad)}%
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                Sin Insumos
                            </CardTitle>
                            <CardDescription>
                                Productos sin insumos configurados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productos_requieren_atencion.sin_insumos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Todos los productos tienen insumos</p>
                            ) : (
                                <div className="space-y-3">
                                    {productos_requieren_atencion.sin_insumos.map((producto) => (
                                        <div key={producto.id} className="flex items-center justify-between border-b pb-2">
                                            <Link
                                                href={`/productos/${producto.id}`}
                                                className="text-sm font-medium hover:underline"
                                            >
                                                {toCamelCase(producto.nombre)}
                                            </Link>
                                            <span className="text-xs text-muted-foreground">
                                                {formatPrice(producto.precio_venta_publico)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Rentabilidad Negativa
                            </CardTitle>
                            <CardDescription>
                                Productos con pérdidas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productos_requieren_atencion.rentabilidad_negativa.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Ningún producto tiene pérdidas</p>
                            ) : (
                                <div className="space-y-3">
                                    {productos_requieren_atencion.rentabilidad_negativa.map((producto) => (
                                        <div key={producto.id} className="flex items-center justify-between border-b pb-2">
                                            <Link
                                                href={`/productos/${producto.id}`}
                                                className="text-sm font-medium hover:underline"
                                            >
                                                {toCamelCase(producto.nombre)}
                                            </Link>
                                            <span className="text-xs font-semibold text-red-600">
                                                {formatPrice(producto.ganancia)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Insumos Más Utilizados */}
                <Card>
                    <CardHeader>
                        <CardTitle>Insumos Más Utilizados</CardTitle>
                        <CardDescription>
                            Top 10 insumos que se usan en más productos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {insumos_mas_utilizados.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay insumos registrados</p>
                        ) : (
                            <div className="space-y-3">
                                {insumos_mas_utilizados.map((insumo, index) => (
                                    <div key={insumo.id} className="flex items-center justify-between border-b pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="font-medium">{toCamelCase(insumo.nombre)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatPrice(insumo.precio)} / {insumo.unidad}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline">
                                            {insumo.productos_count} producto(s)
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Métricas Adicionales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Métricas Adicionales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Promedio de insumos por producto: </span>
                            <span className="font-semibold">{metricas_adicionales.promedio_insumos_por_producto}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
