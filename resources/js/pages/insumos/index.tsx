import { Head, router, useForm } from '@inertiajs/react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatNumberWithSeparator, cleanNumberFormat, handleNumberInputChange, handleNumberInputBlur } from '@/lib/number-format';
import ConfirmDialog from '@/components/confirm-dialog';

interface Insumo {
    id: number;
    nombre: string;
    precio: number;
    unidad: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    insumos: Insumo[];
    unidades_disponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Insumos',
        href: '/insumos',
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

// Función helper para convertir texto a Camel Case
const toCamelCase = (text: string | null | undefined): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function InsumosIndex({ insumos, unidades_disponibles }: Props) {
    const [search, setSearch] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [insumoToDelete, setInsumoToDelete] = useState<number | null>(null);

    const { data, setData, put, post, processing, errors, reset } = useForm({
        nombre: '',
        precio: '',
        unidad: unidades_disponibles[0] || '',
    });

    // Filtrar insumos en el frontend basado en la búsqueda
    const filteredInsumos = useMemo(() => {
        if (!search.trim()) {
            return insumos;
        }
        const searchLower = search.toLowerCase();
        return insumos.filter((insumo) =>
            insumo.nombre.toLowerCase().includes(searchLower)
        );
    }, [insumos, search]);

    const handleDelete = (id: number) => {
        setInsumoToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (insumoToDelete) {
            router.delete(`/insumos/${insumoToDelete}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Insumo eliminado correctamente');
                    setInsumoToDelete(null);
                },
                onError: () => {
                    toast.error('Error al eliminar el insumo');
                },
            });
        }
    };

    const openEditDialog = (insumo: Insumo) => {
        setEditingInsumo(insumo);
        setEditDialogOpen(true);
    };

    const openCreateDialog = () => {
        reset();
        setCreateDialogOpen(true);
    };

    // Actualizar el formulario cuando se abre el modal con un insumo
    useEffect(() => {
        if (editDialogOpen && editingInsumo) {
            setData('nombre', editingInsumo.nombre || '');
            setData('precio', editingInsumo.precio ? formatNumberWithSeparator(Math.round(Number(editingInsumo.precio))) : '');
            setData('unidad', editingInsumo.unidad || unidades_disponibles[0] || '');
        } else if (!editDialogOpen && !createDialogOpen) {
            // Limpiar el formulario cuando se cierran ambos modales
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editDialogOpen, createDialogOpen, editingInsumo]);

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingInsumo || isUpdating) return;
        // Limpiar formato y convertir precio a número entero antes de enviar
        const cleanPrecio = cleanNumberFormat(data.precio as string);
        const precioNumerico = parseInt(cleanPrecio) || 0;
        
        setIsUpdating(true);
        // Enviar datos directamente con el valor limpio
        router.put(`/insumos/${editingInsumo.id}`, {
            nombre: data.nombre,
            precio: precioNumerico,
            unidad: data.unidad,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Insumo actualizado correctamente');
                setEditDialogOpen(false);
                setEditingInsumo(null);
                reset();
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

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCreating) return;
        // Limpiar formato y convertir precio a número entero antes de enviar
        const cleanPrecio = cleanNumberFormat(data.precio as string);
        const precioNumerico = parseInt(cleanPrecio) || 0;
        
        setIsCreating(true);
        // Enviar datos directamente con el valor limpio
        router.post('/insumos', {
            nombre: data.nombre,
            precio: precioNumerico,
            unidad: data.unidad,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Insumo creado correctamente');
                setCreateDialogOpen(false);
                reset();
                setIsCreating(false);
            },
            onError: () => {
                toast.error('Error al crear el insumo');
                setIsCreating(false);
            },
            onFinish: () => {
                setIsCreating(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Insumos" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Insumos</h1>
                        <p className="text-muted-foreground">
                            Gestiona la materia prima de tu heladería
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <PlusIcon className="size-4" />
                        Nuevo Insumo
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar insumos..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {insumos.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No hay insumos registrados
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredInsumos.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground">
                                        No se encontraron insumos que coincidan con la búsqueda
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Precio</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Unidad</th>
                                                        <th className="px-4 py-3 text-left text-sm font-medium">Última actualización</th>
                                                        <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredInsumos.map((insumo) => (
                                                        <tr key={insumo.id} className="border-b hover:bg-muted/50">
                                                            <td className="px-4 py-3">{toCamelCase(insumo.nombre)}</td>
                                                            <td className="px-4 py-3">
                                                                {formatPrice(insumo.precio)}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge variant="outline">{insumo.unidad}</Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                                {new Date(insumo.updated_at).toLocaleDateString('es-ES')}
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
                                                                        onClick={() => handleDelete(insumo.id)}
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
                                        {search && (
                                            <div className="text-sm text-muted-foreground">
                                                Mostrando {filteredInsumos.length} de {insumos.length} insumos
                                            </div>
                                        )}
                                    </>
                                )}
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
                            <DialogTitle>Nuevo Insumo</DialogTitle>
                            <DialogDescription>
                                Agrega un nuevo insumo a tu inventario
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
                                        required
                                    />
                                    <InputError message={errors.nombre} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="create-precio">Precio</Label>
                                    <Input
                                        id="create-precio"
                                        name="precio"
                                        type="text"
                                        placeholder="0"
                                        value={data.precio}
                                        onChange={(e) => handleNumberInputChange(e.target.value, (val) => setData('precio', val))}
                                        onBlur={(e) => handleNumberInputBlur(e.target.value, (val) => setData('precio', val))}
                                        required
                                    />
                                    <InputError message={errors.precio} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="create-unidad">Unidad</Label>
                                    <Select
                                        value={data.unidad}
                                        onValueChange={(value) => setData('unidad', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unidades_disponibles.map((unidad) => (
                                                <SelectItem key={unidad} value={unidad}>
                                                    {unidad}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.unidad} />
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
                                    {isCreating ? 'Creando...' : 'Crear Insumo'}
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
                            setEditingInsumo(null);
                        }
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Insumo</DialogTitle>
                            <DialogDescription>
                                Modifica la información del insumo
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-nombre">Nombre</Label>
                                    <Input
                                        id="edit-nombre"
                                        name="nombre"
                                        value={data.nombre || editingInsumo?.nombre || ''}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.nombre} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-precio">Precio</Label>
                                    <Input
                                        id="edit-precio"
                                        name="precio"
                                        type="text"
                                        value={data.precio || ''}
                                        onChange={(e) => handleNumberInputChange(e.target.value, (val) => setData('precio', val))}
                                        onBlur={(e) => handleNumberInputBlur(e.target.value, (val) => setData('precio', val))}
                                        placeholder="0"
                                        required
                                    />
                                    <InputError message={errors.precio} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-unidad">Unidad</Label>
                                    <Select
                                        value={data.unidad || editingInsumo?.unidad || unidades_disponibles[0] || ''}
                                        onValueChange={(value) => setData('unidad', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unidades_disponibles.map((unidad) => (
                                                <SelectItem key={unidad} value={unidad}>
                                                    {unidad}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.unidad} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditDialogOpen(false);
                                        setEditingInsumo(null);
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
                    title="Eliminar Insumo"
                    description="¿Está seguro de que desea eliminar este insumo? Esta acción no se puede deshacer."
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    variant="destructive"
                    onConfirm={confirmDelete}
                />
            </div>
        </AppLayout>
    );
}
