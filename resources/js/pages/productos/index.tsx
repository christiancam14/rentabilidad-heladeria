import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Insumo {
    id: number;
    nombre: string;
    pivot: {
        costo_preparacion: number;
    };
}

interface Producto {
    id: number;
    nombre: string;
    precio_venta_publico: number;
    costo_total: number;
    ganancia: number;
    porcentaje_rentabilidad: number;
    insumos: Insumo[];
    created_at: string;
}

interface Props {
    productos: {
        data: Producto[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        sort_by?: string;
        sort_order?: string;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: '/productos',
    },
];

// Función helper para formatear precios con separador de miles (punto)
const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return '$0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    if (isNaN(numPrice)) return '$0';
    // Formateo manual con punto como separador de miles
    const rounded = Math.round(numPrice);
    return `$${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

export default function ProductosIndex({ productos, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/productos', { search }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de que desea eliminar este producto?')) {
            router.delete(`/productos/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Productos</h1>
                        <p className="text-muted-foreground">
                            Gestiona los productos de tu heladería
                        </p>
                    </div>
                    <Link href="/productos/create">
                        <Button>
                            <PlusIcon className="size-4" />
                            Nuevo Producto
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="outline">
                                Buscar
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        {productos.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No hay productos registrados
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Precio Venta</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Costo Total</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Ganancia</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Rentabilidad</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Insumos</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productos.data.map((producto) => (
                                                <tr key={producto.id} className="border-b hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-medium">{producto.nombre}</td>
                                                    <td className="px-4 py-3">
                                                        {formatPrice(producto.precio_venta_publico)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {formatPrice(producto.costo_total)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={producto.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {formatPrice(producto.ganancia)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={producto.porcentaje_rentabilidad >= 30 ? 'default' : 'outline'}>
                                                            {producto.porcentaje_rentabilidad.toFixed(2)}%
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {producto.insumos.length} insumo(s)
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={`/productos/${producto.id}`}>
                                                                <Button variant="ghost" size="icon">
                                                                    <EyeIcon className="size-4" />
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/productos/${producto.id}/edit`}>
                                                                <Button variant="ghost" size="icon">
                                                                    <PencilIcon className="size-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(producto.id)}
                                                            >
                                                                <TrashIcon className="size-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {productos.last_page > 1 && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Mostrando {productos.data.length} de {productos.total} productos
                                        </p>
                                        <div className="flex gap-2">
                                            {productos.current_page > 1 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.get('/productos', {
                                                            ...filters,
                                                            page: productos.current_page - 1,
                                                        })
                                                    }
                                                >
                                                    Anterior
                                                </Button>
                                            )}
                                            {productos.current_page < productos.last_page && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.get('/productos', {
                                                            ...filters,
                                                            page: productos.current_page + 1,
                                                        })
                                                    }
                                                >
                                                    Siguiente
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
