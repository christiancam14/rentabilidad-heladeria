import { Head, Link, router, useForm } from '@inertiajs/react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, EyeIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

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
import { formatNumberWithSeparator, cleanNumberFormat, handleNumberInputChange, handleNumberInputBlur } from '@/lib/number-format';
import ConfirmDialog from '@/components/confirm-dialog';

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
    productos: Producto[];
    filters: {
        sort_by?: string;
        sort_order?: string;
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

type SortColumn = 'precio_venta_publico' | 'costo_total' | 'ganancia' | 'porcentaje_rentabilidad' | null;
type SortDirection = 'asc' | 'desc';

export default function ProductosIndex({ productos, filters }: Props) {
    const [search, setSearch] = useState('');
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productoToDelete, setProductoToDelete] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre: '',
        precio_venta_publico: '',
    });

    // Filtrar productos en el frontend basado en la búsqueda
    const filteredProductos = useMemo(() => {
        let result = productos;
        
        // Aplicar filtro de búsqueda
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            result = result.filter((producto) =>
                producto.nombre.toLowerCase().includes(searchLower)
            );
        }

        // Aplicar ordenamiento
        if (sortColumn) {
            result = [...result].sort((a, b) => {
                let aValue: number;
                let bValue: number;

                switch (sortColumn) {
                    case 'precio_venta_publico':
                        aValue = Number(a.precio_venta_publico) || 0;
                        bValue = Number(b.precio_venta_publico) || 0;
                        break;
                    case 'costo_total':
                        aValue = Number(a.costo_total) || 0;
                        bValue = Number(b.costo_total) || 0;
                        break;
                    case 'ganancia':
                        aValue = Number(a.ganancia) || 0;
                        bValue = Number(b.ganancia) || 0;
                        break;
                    case 'porcentaje_rentabilidad':
                        aValue = Number(a.porcentaje_rentabilidad) || 0;
                        bValue = Number(b.porcentaje_rentabilidad) || 0;
                        break;
                    default:
                        return 0;
                }

                if (sortDirection === 'asc') {
                    return aValue - bValue;
                } else {
                    return bValue - aValue;
                }
            });
        }

        return result;
    }, [productos, search, sortColumn, sortDirection]);

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            // Si es la misma columna, cambiar dirección
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Si es una columna diferente, ordenar ascendente
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleDelete = (id: number) => {
        setProductoToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (productoToDelete) {
            router.delete(`/productos/${productoToDelete}`, {
                preserveScroll: true,
            });
            setProductoToDelete(null);
        }
    };

    const openCreateDialog = () => {
        reset();
        setCreateDialogOpen(true);
    };

    const openEditDialog = (producto: Producto) => {
        setEditingProducto(producto);
        setData('nombre', producto.nombre || '');
        setData('precio_venta_publico', producto.precio_venta_publico ? formatNumberWithSeparator(Math.round(Number(producto.precio_venta_publico))) : '');
        setEditDialogOpen(true);
    };

    // Actualizar el formulario cuando se abre el modal con un producto
    useEffect(() => {
        if (editDialogOpen && editingProducto) {
            setData('nombre', editingProducto.nombre || '');
            setData('precio_venta_publico', editingProducto.precio_venta_publico ? formatNumberWithSeparator(Math.round(Number(editingProducto.precio_venta_publico))) : '');
        } else if (!editDialogOpen && !createDialogOpen) {
            // Limpiar el formulario cuando se cierran ambos modales
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editDialogOpen, createDialogOpen, editingProducto]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCreating) return;
        // Limpiar formato y convertir precio a número entero antes de enviar
        const cleanPrecio = cleanNumberFormat(data.precio_venta_publico as string);
        const precioNumerico = parseInt(cleanPrecio) || 0;
        
        setIsCreating(true);
        // Enviar datos directamente con el valor limpio
        router.post('/productos', {
            nombre: data.nombre,
            precio_venta_publico: precioNumerico,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setCreateDialogOpen(false);
                reset();
                setIsCreating(false);
            },
            onError: () => {
                setIsCreating(false);
            },
            onFinish: () => {
                setIsCreating(false);
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProducto || isUpdating) return;
        // Limpiar formato y convertir precio a número entero antes de enviar
        const cleanPrecio = cleanNumberFormat(data.precio_venta_publico as string);
        const precioNumerico = parseInt(cleanPrecio) || 0;
        
        setIsUpdating(true);
        // Enviar datos directamente con el valor limpio
        router.put(`/productos/${editingProducto.id}`, {
            nombre: data.nombre,
            precio_venta_publico: precioNumerico,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditDialogOpen(false);
                setEditingProducto(null);
                reset();
                setIsUpdating(false);
            },
            onError: () => {
                setIsUpdating(false);
            },
            onFinish: () => {
                setIsUpdating(false);
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
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar productos..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredProductos.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                {productos.length === 0
                                    ? 'No hay productos registrados'
                                    : 'No se encontraron productos que coincidan con la búsqueda'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                                                <th 
                                                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/50 select-none"
                                                    onClick={() => handleSort('precio_venta_publico')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Precio Venta
                                                        {sortColumn === 'precio_venta_publico' && (
                                                            sortDirection === 'asc' ? (
                                                                <ArrowUpIcon className="h-4 w-4" />
                                                            ) : (
                                                                <ArrowDownIcon className="h-4 w-4" />
                                                            )
                                                        )}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/50 select-none"
                                                    onClick={() => handleSort('costo_total')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Costo Total
                                                        {sortColumn === 'costo_total' && (
                                                            sortDirection === 'asc' ? (
                                                                <ArrowUpIcon className="h-4 w-4" />
                                                            ) : (
                                                                <ArrowDownIcon className="h-4 w-4" />
                                                            )
                                                        )}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/50 select-none"
                                                    onClick={() => handleSort('ganancia')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Ganancia
                                                        {sortColumn === 'ganancia' && (
                                                            sortDirection === 'asc' ? (
                                                                <ArrowUpIcon className="h-4 w-4" />
                                                            ) : (
                                                                <ArrowDownIcon className="h-4 w-4" />
                                                            )
                                                        )}
                                                    </div>
                                                </th>
                                                <th 
                                                    className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/50 select-none"
                                                    onClick={() => handleSort('porcentaje_rentabilidad')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Rentabilidad
                                                        {sortColumn === 'porcentaje_rentabilidad' && (
                                                            sortDirection === 'asc' ? (
                                                                <ArrowUpIcon className="h-4 w-4" />
                                                            ) : (
                                                                <ArrowDownIcon className="h-4 w-4" />
                                                            )
                                                        )}
                                                    </div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium">Insumos</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProductos.map((producto) => (
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

                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {filteredProductos.length} {filteredProductos.length === 1 ? 'producto' : 'productos'}
                                        {search && ` (de ${productos.length} total)`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal de Creación */}
                <Dialog open={createDialogOpen} onOpenChange={(open) => {
                    if (!isCreating) {
                        setCreateDialogOpen(open);
                        if (!open) {
                            reset();
                        }
                    }
                }}>
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
                                        type="text"
                                        placeholder="0"
                                        value={data.precio_venta_publico}
                                        onChange={(e) => handleNumberInputChange(e.target.value, (val) => setData('precio_venta_publico', val))}
                                        onBlur={(e) => handleNumberInputBlur(e.target.value, (val) => setData('precio_venta_publico', val))}
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
                                    disabled={isCreating}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? 'Creando...' : 'Crear Producto'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal de Edición */}
                <Dialog open={editDialogOpen} onOpenChange={(open) => {
                    if (!isUpdating) {
                        setEditDialogOpen(open);
                        if (!open) {
                            reset();
                            setEditingProducto(null);
                        }
                    }
                }}>
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
                                        type="text"
                                        placeholder="0"
                                        value={data.precio_venta_publico || ''}
                                        onChange={(e) => handleNumberInputChange(e.target.value, (val) => setData('precio_venta_publico', val))}
                                        onBlur={(e) => handleNumberInputBlur(e.target.value, (val) => setData('precio_venta_publico', val))}
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
                                    disabled={isUpdating}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <ConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Eliminar Producto"
                    description="¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer."
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    variant="destructive"
                    onConfirm={confirmDelete}
                />
            </div>
        </AppLayout>
    );
}
