import { Head, Link, router, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, CalculatorIcon, SearchIcon, CheckIcon } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import ConfirmDialog from '@/components/confirm-dialog';

interface Insumo {
    id: number;
    nombre: string;
    precio: number;
    unidad: string;
}

interface InsumoProducto {
    id: number;
    nombre: string;
    precio: number;
    unidad: string;
    pivot: {
        presentacion: number;
        cantidad_preparacion: number;
        valor_unidad: number;
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
    insumos: InsumoProducto[];
}

interface DetalleCostos {
    producto: string;
    precio_venta_publico: number;
    insumos: Array<{
        nombre: string;
        precio_insumo: number;
        unidad: string;
        presentacion: number;
        valor_unidad: number;
        cantidad_preparacion: number;
        costo_preparacion: number;
    }>;
    costo_total: number;
    ganancia: number;
    porcentaje_rentabilidad: number;
}

interface Props {
    producto: Producto;
    insumos: Insumo[];
    detalle_costos: DetalleCostos;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: '/productos',
    },
    {
        title: 'Detalle',
        href: '#',
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

export default function ProductosShow({ producto, insumos, detalle_costos }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingInsumo, setEditingInsumo] = useState<InsumoProducto | null>(null);
    const [insumoSearch, setInsumoSearch] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [insumoToDelete, setInsumoToDelete] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        insumo_id: '',
        presentacion: '',
        cantidad_preparacion: '',
    });

    // Filtrar insumos basado en la búsqueda
    const filteredInsumos = useMemo(() => {
        if (!insumoSearch.trim()) {
            return insumos;
        }
        const searchLower = insumoSearch.toLowerCase();
        return insumos.filter((insumo) =>
            insumo.nombre.toLowerCase().includes(searchLower) ||
            insumo.unidad.toLowerCase().includes(searchLower)
        );
    }, [insumos, insumoSearch]);

    // Obtener el insumo seleccionado para mostrar en el trigger
    const selectedInsumo = useMemo(() => {
        if (!data.insumo_id) return null;
        return insumos.find((insumo) => insumo.id.toString() === data.insumo_id);
    }, [insumos, data.insumo_id]);

    const handleAddInsumo = (e: React.FormEvent) => {
        e.preventDefault();
        if (isAdding) return;
        setIsAdding(true);
        // Convertir valores a números decimales antes de enviar
        const formData = {
            insumo_id: data.insumo_id,
            presentacion: parseFloat(data.presentacion as string) || 0,
            cantidad_preparacion: parseFloat(data.cantidad_preparacion as string) || 0,
        };
        post(`/productos/${producto.id}/insumos`, {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Insumo agregado al producto correctamente');
                reset();
                setInsumoSearch('');
                setDialogOpen(false);
                setIsAdding(false);
            },
            onError: () => {
                toast.error('Error al agregar el insumo al producto');
                setIsAdding(false);
            },
            onFinish: () => {
                setIsAdding(false);
            },
        });
    };

    const handleUpdateInsumo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingInsumo || isUpdating) return;

        setIsUpdating(true);

        // Preparar los datos para enviar (convertir a números decimales)
        const formData = {
            presentacion: parseFloat(data.presentacion as string) || 0,
            cantidad_preparacion: parseFloat(data.cantidad_preparacion as string) || 0,
        };

        // Usar router.put directamente ya que useForm.put no funciona bien con rutas personalizadas
        router.put(`/productos/${producto.id}/insumos/${editingInsumo.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Insumo actualizado correctamente');
                reset();
                setEditingInsumo(null);
                setInsumoSearch('');
                setDialogOpen(false);
                setIsUpdating(false);
            },
            onError: () => {
                toast.error('Error al actualizar el insumo');
                setIsUpdating(false);
            },
            onFinish: () => {
                setIsUpdating(false);
            },
        });
    };

    const handleDeleteInsumo = (insumoId: number) => {
        setInsumoToDelete(insumoId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteInsumo = () => {
        if (insumoToDelete) {
            router.delete(`/productos/${producto.id}/insumos/${insumoToDelete}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Insumo eliminado del producto correctamente');
                    setInsumoToDelete(null);
                },
                onError: () => {
                    toast.error('Error al eliminar el insumo del producto');
                },
            });
        }
    };

    const handleRecalcular = () => {
        router.post(`/productos/${producto.id}/recalcular`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Cálculos recalculados correctamente');
            },
            onError: () => {
                toast.error('Error al recalcular los valores');
            },
        });
    };

    const openEditDialog = (insumo: InsumoProducto) => {
        setEditingInsumo(insumo);
        setData({
            insumo_id: insumo.id.toString(),
            presentacion: Number(insumo.pivot.presentacion).toString(),
            cantidad_preparacion: Number(insumo.pivot.cantidad_preparacion).toString(),
        });
        setDialogOpen(true);
    };

    const openAddDialog = () => {
        reset();
        setEditingInsumo(null);
        setInsumoSearch('');
        setDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${toCamelCase(producto.nombre)} - Detalle`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/productos">
                            <Button variant="ghost" size="icon">
                                <ArrowLeftIcon className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold">{toCamelCase(producto.nombre)}</h1>
                            <p className="text-muted-foreground">
                                Gestión de insumos y cálculo de rentabilidad
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/productos">
                            <Button variant="outline">Volver a Productos</Button>
                        </Link>
                        <Button onClick={handleRecalcular} variant="outline">
                            <CalculatorIcon className="size-4 mr-2" />
                            Recalcular
                        </Button>
                    </div>
                </div>

                {/* Resumen de Rentabilidad */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Precio de Venta</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatPrice(producto.precio_venta_publico)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Costo Total</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatPrice(producto.costo_total)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Ganancia</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${producto.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPrice(producto.ganancia)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Rentabilidad</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <Badge variant={(Number(producto.porcentaje_rentabilidad) || 0) >= 30 ? 'default' : 'outline'} className="text-lg">
                                    {formatPercentage(producto.porcentaje_rentabilidad)}%
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de Insumos */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Insumos del Producto</CardTitle>
                                <CardDescription>
                                    Gestiona los insumos que componen este producto
                                </CardDescription>
                            </div>
                            <Dialog open={dialogOpen} onOpenChange={(open) => {
                                if (!isUpdating && !isAdding && !processing) {
                                    setDialogOpen(open);
                                    if (!open) {
                                        setInsumoSearch('');
                                        reset();
                                        setEditingInsumo(null);
                                        setIsUpdating(false);
                                        setIsAdding(false);
                                    }
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button onClick={openAddDialog}>
                                        <PlusIcon className="size-4 mr-2" />
                                        Agregar Insumo
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingInsumo ? 'Editar Insumo' : 'Agregar Insumo'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {editingInsumo
                                                ? 'Modifica la cantidad de insumo utilizada en este producto'
                                                : 'Selecciona un insumo y define las cantidades'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={editingInsumo ? handleUpdateInsumo : handleAddInsumo}>
                                        <div className="space-y-4 py-4">
                                            {!editingInsumo && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="insumo_id">Insumo</Label>
                                                    <Select
                                                        value={data.insumo_id}
                                                        onValueChange={(value) => {
                                                            setData('insumo_id', value);
                                                            setInsumoSearch(''); // Limpiar búsqueda al seleccionar
                                                        }}
                                                        onOpenChange={(open) => {
                                                            if (!open) {
                                                                setInsumoSearch(''); // Limpiar búsqueda al cerrar
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un insumo">
                                                                {selectedInsumo && (
                                                                    <span>
                                                                        {toCamelCase(selectedInsumo.nombre)} - {formatPrice(selectedInsumo.precio)} / {selectedInsumo.unidad}
                                                                    </span>
                                                                )}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <div className="p-2 border-b">
                                                                <div className="relative">
                                                                    <SearchIcon className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                                    <Input
                                                                        placeholder="Buscar insumo..."
                                                                        value={insumoSearch}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            setInsumoSearch(e.target.value);
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                            e.stopPropagation();
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                            }
                                                                        }}
                                                                        className="pl-8 h-9"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-[200px] overflow-y-auto">
                                                                {filteredInsumos.length === 0 ? (
                                                                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                                                        No se encontraron insumos
                                                                    </div>
                                                                ) : (
                                                                    filteredInsumos.map((insumo) => (
                                                                        <SelectItem key={insumo.id} value={insumo.id.toString()}>
                                                                            <div className="flex items-center justify-between w-full">
                                                                                <span>{toCamelCase(insumo.nombre)}</span>
                                                                                <span className="text-xs text-muted-foreground ml-2">
                                                                                    {formatPrice(insumo.precio)} / {insumo.unidad}
                                                                                </span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.insumo_id} />
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="presentacion">Presentación</Label>
                                                <Input
                                                    id="presentacion"
                                                    type="number"
                                                    step="any"
                                                    min="0.01"
                                                    value={data.presentacion}
                                                    onChange={(e) => setData('presentacion', e.target.value)}
                                                    placeholder="Ej: 10 o 0.5"
                                                    required
                                                />
                                                <InputError message={errors.presentacion} />
                                                <p className="text-xs text-muted-foreground">
                                                    Cantidad total de unidades en la presentación del insumo
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="cantidad_preparacion">Cantidad en Preparación</Label>
                                                <Input
                                                    id="cantidad_preparacion"
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    value={data.cantidad_preparacion}
                                                    onChange={(e) => setData('cantidad_preparacion', e.target.value)}
                                                    placeholder="Ej: 5 o 0.3"
                                                    required
                                                />
                                                <InputError message={errors.cantidad_preparacion} />
                                                <p className="text-xs text-muted-foreground">
                                                    Cantidad de insumo utilizada para preparar este producto
                                                </p>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    if (!isUpdating && !processing) {
                                                        setDialogOpen(false);
                                                    }
                                                }}
                                                disabled={processing || isUpdating || isAdding}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={processing || isUpdating || isAdding}>
                                                {isUpdating || isAdding || processing
                                                    ? (editingInsumo ? 'Actualizando...' : 'Agregando...')
                                                    : (editingInsumo ? 'Actualizar' : 'Agregar')}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {producto.insumos.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No hay insumos agregados a este producto
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-3 text-left text-sm font-medium">Insumo</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Precio Insumo</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Presentación</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Valor Unidad</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Cant. Preparación</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium">Costo Preparación</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {producto.insumos.map((insumo) => (
                                            <tr key={insumo.id} className="border-b hover:bg-muted/50">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <div className="font-medium">{toCamelCase(insumo.nombre)}</div>
                                                        <div className="text-xs text-muted-foreground">{insumo.unidad}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {formatPrice(insumo.precio)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {Number(insumo.pivot.presentacion).toLocaleString('es-ES', { 
                                                        minimumFractionDigits: 0, 
                                                        maximumFractionDigits: 2 
                                                    })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {formatPrice(insumo.pivot.valor_unidad)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {Number(insumo.pivot.cantidad_preparacion).toLocaleString('es-ES', { 
                                                        minimumFractionDigits: 0, 
                                                        maximumFractionDigits: 2 
                                                    })}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {formatPrice(insumo.pivot.costo_preparacion)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditDialog(insumo)}
                                                        >
                                                            <PencilIcon className="size-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteInsumo(insumo.id)}
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
                        )}
                    </CardContent>
                </Card>

                <ConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Eliminar Insumo"
                    description="¿Está seguro de que desea eliminar este insumo del producto? Esta acción no se puede deshacer."
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    variant="destructive"
                    onConfirm={confirmDeleteInsumo}
                />
            </div>
        </AppLayout>
    );
}
