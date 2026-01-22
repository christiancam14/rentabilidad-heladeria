import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, SearchIcon, EditIcon } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

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
import { formatNumberWithSeparator, cleanNumberFormat, handleNumberInputChange, handleNumberInputBlur } from '@/lib/number-format';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Producto {
    id: number;
    nombre: string;
    precio_venta_publico: number;
    costo_total: number;
}

interface ProductoVendido {
    id: number;
    producto: Producto;
    pivot: {
        cantidad_vendida: number;
        precio_venta_snapshot: number;
        costo_unitario_snapshot: number;
    };
}

interface Gasto {
    id: number;
    nombre: string;
    valor: number;
}

interface CierreMes {
    id: number;
    nombre: string | null;
    anio: number;
    mes: number;
    gastos?: Gasto[];
    productos_vendidos?: ProductoVendido[];
}

interface Props {
    cierre: CierreMes;
    productos: Producto[];
    ingresos: number;
    costos: number;
    total_gastos: number;
    ganancia_bruta: number;
    ganancia_neta: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cierres de Mes',
        href: '/cierres-mes',
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
    const rounded = Math.round(numPrice);
    return `$${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
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

// Función helper para obtener nombre del mes
const getNombreMes = (mes: number): string => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || '';
};

export default function CierresMesShow({
    cierre,
    productos,
    ingresos,
    costos,
    total_gastos,
    ganancia_bruta,
    ganancia_neta,
}: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [gastoDialogOpen, setGastoDialogOpen] = useState(false);
    const [editCierreDialogOpen, setEditCierreDialogOpen] = useState(false);
    const [editingProducto, setEditingProducto] = useState<ProductoVendido | null>(null);
    const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
    const [productoSearch, setProductoSearch] = useState('');
    const [cierreId, setCierreId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        producto_id: '',
        cantidad_vendida: '',
    });

    const { data: gastoData, setData: setGastoData, post: postGasto, put: putGasto, processing: processingGasto, errors: gastoErrors, reset: resetGasto } = useForm({
        nombre: '',
        valor: '',
    });

    const { data: cierreData, setData: setCierreData, processing: processingCierre, errors: cierreErrors, reset: resetCierre } = useForm({
        nombre: '',
        anio: '',
        mes: '',
    });

    // Inicializar datos del formulario cuando se abre el modal
    useEffect(() => {
        if (editCierreDialogOpen && cierre && cierre.id) {
            setCierreId(cierre.id);
            setCierreData('nombre', cierre.nombre || '');
            setCierreData('anio', (cierre.anio ?? new Date().getFullYear()).toString());
            setCierreData('mes', (cierre.mes ?? new Date().getMonth() + 1).toString());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editCierreDialogOpen, cierre]);
    
    // También actualizar cierreId cuando cierre cambia
    useEffect(() => {
        if (cierre?.id) {
            setCierreId(cierre.id);
        }
    }, [cierre]);

    // Obtener productos vendidos desde la relación
    const productosVendidos = cierre?.productos_vendidos || [];
    const gastos = cierre?.gastos || [];

    // Filtrar productos disponibles basado en la búsqueda
    const filteredProductos = useMemo(() => {
        if (!productoSearch.trim()) {
            return productos;
        }
        const searchLower = productoSearch.toLowerCase();
        return productos.filter((producto) =>
            producto.nombre.toLowerCase().includes(searchLower)
        );
    }, [productos, productoSearch]);

    // Obtener el producto seleccionado para mostrar en el trigger
    const selectedProducto = useMemo(() => {
        if (!data.producto_id) return null;
        return productos.find((producto) => producto.id.toString() === data.producto_id);
    }, [productos, data.producto_id]);

    const handleAddProducto = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cierre?.id) return;
        post(`/cierres-mes/${cierre.id}/productos`, {
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                reset();
                setProductoSearch('');
            },
        });
    };

    const handleUpdateProducto = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProducto || !cierre?.id) return;
        put(`/cierres-mes/${cierre.id}/productos/${editingProducto.producto.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                reset();
                setEditingProducto(null);
                setProductoSearch('');
            },
        });
    };

    const handleDeleteProducto = (productoId: number) => {
        if (!cierre?.id) return;
        if (confirm('¿Está seguro de que desea eliminar este producto del cierre?')) {
            router.delete(`/cierres-mes/${cierre.id}/productos/${productoId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleAddGasto = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cierre?.id) return;
        // Limpiar formato y convertir valor a número entero antes de enviar
        const cleanValue = cleanNumberFormat(gastoData.valor as string);
        const valorNumerico = parseInt(cleanValue) || 0;
        
        // Enviar datos directamente con el valor limpio
        router.post(`/cierres-mes/${cierre.id}/gastos`, {
            nombre: gastoData.nombre,
            valor: valorNumerico,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setGastoDialogOpen(false);
                resetGasto();
            },
        });
    };

    const handleUpdateGasto = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGasto || !cierre?.id) return;
        // Limpiar formato y convertir valor a número entero antes de enviar
        const cleanValue = cleanNumberFormat(gastoData.valor as string);
        const valorNumerico = parseInt(cleanValue) || 0;
        
        // Enviar datos directamente con el valor limpio
        router.put(`/cierres-mes/${cierre.id}/gastos/${editingGasto.id}`, {
            nombre: gastoData.nombre,
            valor: valorNumerico,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setGastoDialogOpen(false);
                resetGasto();
                setEditingGasto(null);
            },
        });
    };

    const handleDeleteGasto = (gastoId: number) => {
        if (!cierre?.id) return;
        if (confirm('¿Está seguro de que desea eliminar este gasto?')) {
            router.delete(`/cierres-mes/${cierre.id}/gastos/${gastoId}`, {
                preserveScroll: true,
            });
        }
    };

    const openEditDialog = (productoVendido: ProductoVendido) => {
        setEditingProducto(productoVendido);
        setData({
            producto_id: productoVendido.producto.id.toString(),
            cantidad_vendida: productoVendido.pivot.cantidad_vendida.toString(),
        });
        setDialogOpen(true);
    };

    const openAddDialog = () => {
        reset();
        setEditingProducto(null);
        setProductoSearch('');
        setDialogOpen(true);
    };

    const openEditGastoDialog = (gasto: Gasto) => {
        setEditingGasto(gasto);
        setGastoData({
            nombre: gasto.nombre,
            valor: formatNumberWithSeparator(Math.round(Number(gasto.valor))),
        });
        setGastoDialogOpen(true);
    };

    const openAddGastoDialog = () => {
        resetGasto();
        setEditingGasto(null);
        setGastoDialogOpen(true);
    };

    const handleEditCierreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Obtener el ID del cierre de forma robusta (usar estado, prop, o URL)
        const currentCierreId = cierreId || cierre?.id || (typeof window !== 'undefined' ? parseInt(window.location.pathname.split('/').pop() || '0', 10) : null);
        
        if (!currentCierreId || currentCierreId === 0) {
            return;
        }
        
        // Validar que los campos requeridos estén llenos
        if (!cierreData.anio || !cierreData.mes) {
            return;
        }
        
        // Preparar los datos para enviar
        const formData = {
            nombre: cierreData.nombre || null,
            anio: parseInt(String(cierreData.anio), 10),
            mes: parseInt(String(cierreData.mes), 10),
        };
        
        // Usar router.put directamente para asegurar que funcione
        router.put(`/cierres-mes/${currentCierreId}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditCierreDialogOpen(false);
                resetCierre();
            },
            onError: (errors) => {
                console.error('Errores al actualizar:', errors);
            },
            onFinish: () => {
                console.log('Request finished');
            },
        });
    };

    // Calcular período de forma segura con valores por defecto
    const mesNum = cierre?.mes != null ? (typeof cierre.mes === 'number' ? cierre.mes : parseInt(String(cierre.mes), 10)) : new Date().getMonth() + 1;
    const anioNum = cierre?.anio != null ? (typeof cierre.anio === 'number' ? cierre.anio : parseInt(String(cierre.anio), 10)) : new Date().getFullYear();
    const periodo = `${getNombreMes(mesNum)} ${anioNum}`;
    
    const titulo = cierre?.nombre 
        ? toCamelCase(cierre.nombre) 
        : `Cierre de ${periodo}`;
    
    const subtitulo = cierre?.nombre 
        ? periodo 
        : 'Gestión de productos vendidos y rentabilidad mensual';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={titulo} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/cierres-mes">
                            <Button variant="ghost" size="icon">
                                <ArrowLeftIcon className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold">
                                {titulo}
                            </h1>
                            <p className="text-muted-foreground">
                                {subtitulo}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/cierres-mes">Volver a Cierres</Link>
                        </Button>
                        <Button variant="outline" onClick={() => {
                            if (cierre) {
                                setCierreData('nombre', cierre.nombre || '');
                                setCierreData('anio', (cierre.anio ?? new Date().getFullYear()).toString());
                                setCierreData('mes', (cierre.mes ?? new Date().getMonth() + 1).toString());
                            }
                            setEditCierreDialogOpen(true);
                        }}>
                            <EditIcon className="size-4 mr-2" />
                            Editar Cierre
                        </Button>
                    </div>
                </div>

                {/* Resumen de Rentabilidad */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Ingresos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatPrice(ingresos)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Costos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatPrice(costos)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Gastos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatPrice(total_gastos)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Ganancia Bruta</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${ganancia_bruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPrice(ganancia_bruta)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Ganancia Neta</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPrice(ganancia_neta)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de Productos Vendidos */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Productos Vendidos</CardTitle>
                                <CardDescription>
                                    Gestiona los productos vendidos en este mes
                                </CardDescription>
                            </div>
                            <Dialog open={dialogOpen} onOpenChange={(open) => {
                                if (!processing) {
                                    setDialogOpen(open);
                                    if (!open) {
                                        setProductoSearch('');
                                        reset();
                                        setEditingProducto(null);
                                    }
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button onClick={openAddDialog}>
                                        <PlusIcon className="size-4 mr-2" />
                                        Agregar Producto
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingProducto ? 'Editar Producto' : 'Agregar Producto'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {editingProducto
                                                ? 'Modifica la cantidad vendida de este producto'
                                                : 'Selecciona un producto y define la cantidad vendida'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={editingProducto ? handleUpdateProducto : handleAddProducto}>
                                        <div className="space-y-4 py-4">
                                            {!editingProducto && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="producto_id">Producto</Label>
                                                    <Select
                                                        value={data.producto_id}
                                                        onValueChange={(value) => {
                                                            setData('producto_id', value);
                                                            setProductoSearch('');
                                                        }}
                                                        onOpenChange={(open) => {
                                                            if (!open) {
                                                                setProductoSearch('');
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un producto">
                                                                {selectedProducto && (
                                                                    <span>
                                                                        {toCamelCase(selectedProducto.nombre)} - {formatPrice(selectedProducto.precio_venta_publico)}
                                                                    </span>
                                                                )}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <div className="p-2 border-b">
                                                                <div className="relative">
                                                                    <SearchIcon className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                                    <Input
                                                                        placeholder="Buscar producto..."
                                                                        value={productoSearch}
                                                                        onChange={(e) => {
                                                                            e.stopPropagation();
                                                                            setProductoSearch(e.target.value);
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
                                                                {filteredProductos.length === 0 ? (
                                                                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                                                        No se encontraron productos
                                                                    </div>
                                                                ) : (
                                                                    filteredProductos.map((producto) => (
                                                                        <SelectItem
                                                                            key={producto.id}
                                                                            value={producto.id.toString()}
                                                                        >
                                                                            <div className="flex items-center justify-between w-full">
                                                                                <span>{toCamelCase(producto.nombre)}</span>
                                                                                <span className="text-xs text-muted-foreground ml-2">
                                                                                    {formatPrice(producto.precio_venta_publico)}
                                                                                </span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.producto_id} />
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="cantidad_vendida">Cantidad Vendida</Label>
                                                <Input
                                                    id="cantidad_vendida"
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={data.cantidad_vendida}
                                                    onChange={(e) => setData('cantidad_vendida', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.cantidad_vendida} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setDialogOpen(false);
                                                    reset();
                                                    setProductoSearch('');
                                                    setEditingProducto(null);
                                                }}
                                                disabled={processing}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing
                                                    ? 'Guardando...'
                                                    : editingProducto
                                                      ? 'Actualizar'
                                                      : 'Agregar'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {productosVendidos.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    No hay productos vendidos registrados para este mes.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2 font-medium">Producto</th>
                                            <th className="text-right p-2 font-medium">Cantidad</th>
                                            <th className="text-right p-2 font-medium">Precio Unit.</th>
                                            <th className="text-right p-2 font-medium">Costo Unit.</th>
                                            <th className="text-right p-2 font-medium">Ingresos</th>
                                            <th className="text-right p-2 font-medium">Costos</th>
                                            <th className="text-right p-2 font-medium">Ganancia</th>
                                            <th className="text-right p-2 font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosVendidos.map((productoVendido) => {
                                            const ingresosProducto =
                                                productoVendido.pivot.cantidad_vendida *
                                                productoVendido.pivot.precio_venta_snapshot;
                                            const costosProducto =
                                                productoVendido.pivot.cantidad_vendida *
                                                productoVendido.pivot.costo_unitario_snapshot;
                                            const gananciaProducto = ingresosProducto - costosProducto;

                                            return (
                                                <tr
                                                    key={productoVendido.id}
                                                    className="border-b hover:bg-muted/50"
                                                >
                                                    <td className="p-2">
                                                        {toCamelCase(productoVendido.producto.nombre)}
                                                    </td>
                                                    <td className="text-right p-2">
                                                        {productoVendido.pivot.cantidad_vendida.toLocaleString('es-ES')}
                                                    </td>
                                                    <td className="text-right p-2">
                                                        {formatPrice(productoVendido.pivot.precio_venta_snapshot)}
                                                    </td>
                                                    <td className="text-right p-2">
                                                        {formatPrice(productoVendido.pivot.costo_unitario_snapshot)}
                                                    </td>
                                                    <td className="text-right p-2">
                                                        {formatPrice(ingresosProducto)}
                                                    </td>
                                                    <td className="text-right p-2">
                                                        {formatPrice(costosProducto)}
                                                    </td>
                                                    <td className="text-right p-2">
                                                        <Badge
                                                            variant={
                                                                gananciaProducto >= 0 ? 'default' : 'destructive'
                                                            }
                                                        >
                                                            {formatPrice(gananciaProducto)}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-right p-2">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditDialog(productoVendido)}
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDeleteProducto(productoVendido.producto.id)
                                                                }
                                                            >
                                                                <TrashIcon className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Lista de Gastos */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Gastos del Mes</CardTitle>
                                <CardDescription>
                                    Gestiona los gastos del mes
                                </CardDescription>
                            </div>
                            <Dialog open={gastoDialogOpen} onOpenChange={(open) => {
                                if (!processingGasto) {
                                    setGastoDialogOpen(open);
                                    if (!open) {
                                        resetGasto();
                                        setEditingGasto(null);
                                    }
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button onClick={openAddGastoDialog}>
                                        <PlusIcon className="size-4 mr-2" />
                                        Agregar Gasto
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingGasto ? 'Editar Gasto' : 'Agregar Gasto'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {editingGasto
                                                ? 'Modifica la información del gasto'
                                                : 'Agrega un nuevo gasto al cierre del mes'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={editingGasto ? handleUpdateGasto : handleAddGasto}>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="gasto_nombre">Nombre del Gasto</Label>
                                                <Input
                                                    id="gasto_nombre"
                                                    type="text"
                                                    value={gastoData.nombre}
                                                    onChange={(e) => setGastoData('nombre', e.target.value)}
                                                    placeholder="Ej: Arriendo, Servicios, etc."
                                                    required
                                                />
                                                <InputError message={gastoErrors.nombre} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="gasto_valor">Valor</Label>
                                                <Input
                                                    id="gasto_valor"
                                                    type="text"
                                                    value={gastoData.valor}
                                                    onChange={(e) => handleNumberInputChange(e.target.value, (val) => setGastoData('valor', val))}
                                                    onBlur={(e) => handleNumberInputBlur(e.target.value, (val) => setGastoData('valor', val))}
                                                    placeholder="0"
                                                    required
                                                />
                                                <InputError message={gastoErrors.valor} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setGastoDialogOpen(false);
                                                    resetGasto();
                                                    setEditingGasto(null);
                                                }}
                                                disabled={processingGasto}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={processingGasto}>
                                                {processingGasto
                                                    ? 'Guardando...'
                                                    : editingGasto
                                                      ? 'Actualizar'
                                                      : 'Agregar'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {gastos.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    No hay gastos registrados para este mes.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2 font-medium">Nombre</th>
                                            <th className="text-right p-2 font-medium">Valor</th>
                                            <th className="text-right p-2 font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gastos.map((gasto) => (
                                            <tr
                                                key={gasto.id}
                                                className="border-b hover:bg-muted/50"
                                            >
                                                <td className="p-2">
                                                    {toCamelCase(gasto.nombre)}
                                                </td>
                                                <td className="text-right p-2">
                                                    {formatPrice(gasto.valor)}
                                                </td>
                                                <td className="text-right p-2">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditGastoDialog(gasto)}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteGasto(gasto.id)}
                                                        >
                                                            <TrashIcon className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t font-semibold">
                                            <td className="p-2">Total</td>
                                            <td className="text-right p-2">
                                                {formatPrice(total_gastos)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal de Edición del Cierre */}
                <Dialog open={editCierreDialogOpen} onOpenChange={(open) => {
                    if (!processingCierre) {
                        setEditCierreDialogOpen(open);
                        if (!open) {
                            resetCierre();
                        }
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Cierre de Mes</DialogTitle>
                            <DialogDescription>
                                Modifica la información del cierre mensual
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditCierreSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit_nombre">Nombre del Cierre (Opcional)</Label>
                                    <Input
                                        id="edit_nombre"
                                        type="text"
                                        value={cierreData.nombre}
                                        onChange={(e) => setCierreData('nombre', e.target.value)}
                                        placeholder="Ej: Cierre Enero 2025"
                                    />
                                    <InputError message={cierreErrors.nombre} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit_anio">Año *</Label>
                                        <Input
                                            id="edit_anio"
                                            type="number"
                                            min="2000"
                                            max="2100"
                                            value={cierreData.anio}
                                            onChange={(e) => setCierreData('anio', e.target.value)}
                                            required
                                        />
                                        <InputError message={cierreErrors.anio} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit_mes">Mes *</Label>
                                        <Select 
                                            value={cierreData.mes || ''} 
                                            onValueChange={(value) => setCierreData('mes', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un mes" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    { value: '1', label: 'Enero' },
                                                    { value: '2', label: 'Febrero' },
                                                    { value: '3', label: 'Marzo' },
                                                    { value: '4', label: 'Abril' },
                                                    { value: '5', label: 'Mayo' },
                                                    { value: '6', label: 'Junio' },
                                                    { value: '7', label: 'Julio' },
                                                    { value: '8', label: 'Agosto' },
                                                    { value: '9', label: 'Septiembre' },
                                                    { value: '10', label: 'Octubre' },
                                                    { value: '11', label: 'Noviembre' },
                                                    { value: '12', label: 'Diciembre' },
                                                ].map((mes) => (
                                                    <SelectItem key={mes.value} value={mes.value}>
                                                        {mes.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={cierreErrors.mes} />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditCierreDialogOpen(false);
                                        resetCierre();
                                    }}
                                    disabled={processingCierre}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processingCierre}>
                                    {processingCierre ? 'Actualizando...' : 'Actualizar Cierre'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
