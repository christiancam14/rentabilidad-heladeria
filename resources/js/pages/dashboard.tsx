import { Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { type ReactNode } from 'react';

import { PageHeader } from '@/components/brand/panel';
import { PillLink } from '@/components/brand/pill-button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Resumen',
        href: dashboard().url,
    },
];

function Tile({ fondo, etiqueta, valor, href, children }: { fondo: string; etiqueta: string; valor: string; href?: string; children: ReactNode }) {
    const contenido = (
        <>
            <p className="text-meta text-[11px] opacity-80">{etiqueta}</p>
            <p className="font-display text-[30px] leading-none font-extrabold tracking-[-0.04em] md:text-[34px]">{valor}</p>
            <p className="text-xs font-medium opacity-80">{children}</p>
        </>
    );
    const clase = `flex flex-col gap-1.5 rounded-[24px] border border-tinta/8 p-[22px] ${fondo}`;
    return href ? (
        <Link href={href} className={`${clase} transition-transform hover:-translate-y-0.5`}>
            {contenido}
        </Link>
    ) : (
        <div className={clase}>{contenido}</div>
    );
}

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

interface ProductoVendido {
    id: number;
    nombre: string;
    precio_venta_publico: number;
    total_vendido: number;
}

interface Props {
    tienda: {
        ventas_hoy: number;
        pedidos_hoy: number;
        en_curso: number;
        productos_visibles: number;
        agotados: number;
    };
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
        excelente: number;
        media: number;
        baja: number;
        negativa: number;
    };
    insumos_mas_utilizados: Insumo[];
    productos_mas_vendidos: ProductoVendido[];
    productos_menos_vendidos: ProductoVendido[];
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
    tienda,
    kpis,
    top_productos_rentabilidad,
    top_productos_ganancia,
    productos_requieren_atencion,
    estadisticas_financieras,
    metricas_adicionales,
    distribucion_rentabilidad,
    insumos_mas_utilizados,
    productos_mas_vendidos,
    productos_menos_vendidos,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resumen" />
            <div className="space-y-6">
                <PageHeader
                    titulo="Resumen"
                    descripcion="Lo que pasa hoy en tu heladería y qué tan rentable es cada producto."
                    acciones={
                        <PillLink href="/admin/pedidos" tamano="lg" flecha>
                            Ver pedidos
                        </PillLink>
                    }
                />

                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    <Tile fondo="bg-turquesa text-white" etiqueta="Ventas de hoy" valor={formatPrice(tienda.ventas_hoy)}>
                        {tienda.pedidos_hoy} pedidos por el menú digital
                    </Tile>
                    <Tile fondo="bg-white" etiqueta="Pedidos en curso" valor={String(tienda.en_curso)} href="/admin/pedidos">
                        Nuevos, preparando o listos
                    </Tile>
                    <Tile fondo="bg-amarillo" etiqueta="Rentabilidad promedio" valor={`${formatPercentage(kpis.rentabilidad_promedio)}%`}>
                        {kpis.total_productos} productos · {kpis.total_insumos} insumos
                    </Tile>
                    <Tile
                        fondo={kpis.productos_incompletos > 0 ? 'bg-rosa-suave' : 'bg-white'}
                        etiqueta="Sin receta"
                        valor={String(kpis.productos_incompletos)}
                        href="/productos"
                    >
                        {tienda.productos_visibles} en el menú · {tienda.agotados} agotados
                    </Tile>
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
                                                variant={producto.porcentaje_rentabilidad >= 60 ? 'default' : 'outline'}
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

                {/* Productos Más y Menos Vendidos */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos Más Vendidos</CardTitle>
                            <CardDescription>
                                Top 10 productos con mayor cantidad vendida en cierres de mes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productos_mas_vendidos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay datos de ventas registrados</p>
                            ) : (
                                <div className="space-y-4">
                                    {productos_mas_vendidos.map((producto, index) => (
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
                                                        Precio: {formatPrice(producto.precio_venta_publico)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="default" className="font-semibold">
                                                {producto.total_vendido} unidades
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Productos Menos Vendidos</CardTitle>
                            <CardDescription>
                                Top 10 productos con menor cantidad vendida en cierres de mes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productos_menos_vendidos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay datos de ventas registrados</p>
                            ) : (
                                <div className="space-y-4">
                                    {productos_menos_vendidos.map((producto, index) => (
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
                                                        Precio: {formatPrice(producto.precio_venta_publico)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="font-semibold">
                                                {producto.total_vendido} unidades
                                            </Badge>
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
                                <div className="text-2xl font-bold text-green-600">{distribucion_rentabilidad.excelente}</div>
                                <div className="text-sm text-muted-foreground">Excelente (≥60%)</div>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border p-4">
                                <div className="text-2xl font-bold text-blue-600">{distribucion_rentabilidad.media}</div>
                                <div className="text-sm text-muted-foreground">Media (40-60%)</div>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border p-4">
                                <div className="text-2xl font-bold text-yellow-600">{distribucion_rentabilidad.baja}</div>
                                <div className="text-sm text-muted-foreground">Baja (0-40%)</div>
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
                                Productos con rentabilidad &lt;40%
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
