import { Head, Link, router, useForm } from '@inertiajs/react';
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

export default function ProductosShow({ producto, insumos, detalle_costos }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingInsumo, setEditingInsumo] = useState<InsumoProducto | null>(null);
    const [insumoSearch, setInsumoSearch] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

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
        // Convertir valores a enteros antes de enviar
        const formData = {
            insumo_id: data.insumo_id,
            presentacion: parseInt(data.presentacion as string) || 1,
            cantidad_preparacion: parseInt(data.cantidad_preparacion as string) || 0,
        };
        post(`/productos/${producto.id}/insumos`, {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setInsumoSearch('');
                setDialogOpen(false);
            },
        });
    };

    const handleUpdateInsumo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingInsumo || isUpdating) return;

        setIsUpdating(true);

        // Preparar los datos para enviar (convertir a enteros)
        const formData = {
            presentacion: parseInt(data.presentacion as string) || 1,
            cantidad_preparacion: parseInt(data.cantidad_preparacion as string) || 0,
        };

        // Usar router.put directamente ya que useForm.put no funciona bien con rutas personalizadas
        router.put(`/productos/${producto.id}/insumos/${editingInsumo.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditingInsumo(null);
                setInsumoSearch('');
                setDialogOpen(false);
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

    const handleDeleteInsumo = (insumoId: number) => {
        if (confirm('¿Está seguro de que desea eliminar este insumo del producto?')) {
            router.delete(`/productos/${producto.id}/insumos/${insumoId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleRecalcular = () => {
        router.post(`/productos/${producto.id}/recalcular`, {}, {
            preserveScroll: true,
        });
    };

    const openEditDialog = (insumo: InsumoProducto) => {
        setEditingInsumo(insumo);
        setData({
            insumo_id: insumo.id.toString(),
            presentacion: Math.round(Number(insumo.pivot.presentacion)).toString(),
            cantidad_preparacion: Math.round(Number(insumo.pivot.cantidad_preparacion)).toString(),
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
            <Head title={`${producto.nombre} - Detalle`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/productos">
                            <Button variant="ghost" size="icon">
                                <ArrowLeftIcon className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold">{producto.nombre}</h1>
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
                                if (!isUpdating && !processing) {
                                    setDialogOpen(open);
                                    if (!open) {
                                        setInsumoSearch('');
                                        reset();
                                        setEditingInsumo(null);
                                        setIsUpdating(false);
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
                                                                        {selectedInsumo.nombre} - {formatPrice(selectedInsumo.precio)} / {selectedInsumo.unidad}
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
                                                                                <span>{insumo.nombre}</span>
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
                                                    step="1"
                                                    min="1"
                                                    value={data.presentacion}
                                                    onChange={(e) => setData('presentacion', e.target.value)}
                                                    placeholder="Ej: 10"
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
                                                    step="1"
                                                    min="0"
                                                    value={data.cantidad_preparacion}
                                                    onChange={(e) => setData('cantidad_preparacion', e.target.value)}
                                                    placeholder="Ej: 5"
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
                                                disabled={processing || isUpdating}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={processing || isUpdating}>
                                                {isUpdating || processing
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
                                                        <div className="font-medium">{insumo.nombre}</div>
                                                        <div className="text-xs text-muted-foreground">{insumo.unidad}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {formatPrice(insumo.precio)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {Math.round(Number(insumo.pivot.presentacion))}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {formatPrice(insumo.pivot.valor_unidad)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {Math.round(Number(insumo.pivot.cantidad_preparacion))}
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
            </div>
        </AppLayout>
    );
}
