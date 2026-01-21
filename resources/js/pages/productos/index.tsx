import { Head, Link, router, useForm } from '@inertiajs/react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
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

export default function ProductosIndex({ productos, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre: '',
        precio_venta_publico: '',
    });

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

    const openCreateDialog = () => {
        reset();
        setCreateDialogOpen(true);
    };

    const openEditDialog = (producto: Producto) => {
        setEditingProducto(producto);
        setData('nombre', producto.nombre || '');
        setData('precio_venta_publico', producto.precio_venta_publico ? Math.round(Number(producto.precio_venta_publico)).toString() : '');
        setEditDialogOpen(true);
    };

    // Actualizar el formulario cuando se abre el modal con un producto
    useEffect(() => {
        if (editDialogOpen && editingProducto) {
            setData('nombre', editingProducto.nombre || '');
            setData('precio_venta_publico', editingProducto.precio_venta_publico ? Math.round(Number(editingProducto.precio_venta_publico)).toString() : '');
        } else if (!editDialogOpen && !createDialogOpen) {
            // Limpiar el formulario cuando se cierran ambos modales
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editDialogOpen, createDialogOpen, editingProducto]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convertir precio a número entero antes de enviar
        setData('precio_venta_publico', String(parseInt(data.precio_venta_publico as string) || 0));
        post('/productos', {
            preserveScroll: true,
            onSuccess: () => {
                setCreateDialogOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProducto) return;
        // Convertir precio a número entero antes de enviar
        setData('precio_venta_publico', String(parseInt(data.precio_venta_publico as string) || 0));
        put(`/productos/${editingProducto.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditDialogOpen(false);
                setEditingProducto(null);
                reset();
            },
        });
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
                    <Button onClick={openCreateDialog}>
                        <PlusIcon className="size-4" />
                        Nuevo Producto
                    </Button>
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
                                                    <td className="px-4 py-3 font-medium">{toCamelCase(producto.nombre)}</td>
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
                                                        <Badge variant={(Number(producto.porcentaje_rentabilidad) || 0) >= 30 ? 'default' : 'outline'}>
                                                            {formatPercentage(producto.porcentaje_rentabilidad)}%
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
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openEditDialog(producto)}
                                                            >
                                                                <PencilIcon className="size-4" />
                                                            </Button>
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

                {/* Modal de Creación */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nuevo Producto</DialogTitle>
                            <DialogDescription>
                                Crea un nuevo producto. Podrás agregar insumos después de crearlo.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create-nombre">Nombre</Label>
                                    <Input
                                        id="create-nombre"
                                        name="nombre"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        placeholder="Ej: Helado de Vainilla, Helado de Chocolate..."
                                        required
                                    />
                                    <InputError message={errors.nombre} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="create-precio_venta_publico">Precio de Venta Público</Label>
                                    <Input
                                        id="create-precio_venta_publico"
                                        name="precio_venta_publico"
                                        type="number"
                                        step="1"
                                        min="0"
                                        placeholder="0"
                                        value={data.precio_venta_publico}
                                        onChange={(e) => setData('precio_venta_publico', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.precio_venta_publico} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setCreateDialogOpen(false);
                                        reset();
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Crear Producto
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal de Edición */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Producto</DialogTitle>
                            <DialogDescription>
                                Modifica la información del producto
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-nombre">Nombre</Label>
                                    <Input
                                        id="edit-nombre"
                                        name="nombre"
                                        value={data.nombre || editingProducto?.nombre || ''}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.nombre} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-precio_venta_publico">Precio de Venta Público</Label>
                                    <Input
                                        id="edit-precio_venta_publico"
                                        name="precio_venta_publico"
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={data.precio_venta_publico || (editingProducto?.precio_venta_publico ? Math.round(Number(editingProducto.precio_venta_publico)).toString() : '')}
                                        onChange={(e) => setData('precio_venta_publico', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.precio_venta_publico} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditDialogOpen(false);
                                        setEditingProducto(null);
                                        reset();
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
