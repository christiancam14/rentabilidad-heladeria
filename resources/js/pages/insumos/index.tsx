import { Head, router, useForm } from '@inertiajs/react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

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

interface Insumo {
    id: number;
    nombre: string;
    precio: number;
    unidad: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    insumos: {
        data: Insumo[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    unidades_disponibles: string[];
    filters: {
        search?: string;
        sort_by?: string;
        sort_order?: string;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Insumos',
        href: '/insumos',
    },
];

export default function InsumosIndex({ insumos, unidades_disponibles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

    const { data, setData, put, post, processing, errors, reset } = useForm({
        nombre: '',
        precio: '',
        unidad: unidades_disponibles[0] || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/insumos', { search }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de que desea eliminar este insumo?')) {
            router.delete(`/insumos/${id}`, {
                preserveScroll: true,
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
            setData('precio', editingInsumo.precio ? Math.round(Number(editingInsumo.precio)).toString() : '');
            setData('unidad', editingInsumo.unidad || unidades_disponibles[0] || '');
        } else if (!editDialogOpen && !createDialogOpen) {
            // Limpiar el formulario cuando se cierran ambos modales
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editDialogOpen, createDialogOpen, editingInsumo]);

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingInsumo) return;

        put(`/insumos/${editingInsumo.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditDialogOpen(false);
                setEditingInsumo(null);
                reset();
            },
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convertir precio a número entero antes de enviar
        setData('precio', String(parseInt(data.precio as string) || 0));
        post('/insumos', {
            preserveScroll: true,
            onSuccess: () => {
                setCreateDialogOpen(false);
                reset();
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
                        <form onSubmit={handleSearch} className="flex gap-2">
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
                            <Button type="submit" variant="outline">
                                Buscar
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        {insumos.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No hay insumos registrados
                            </div>
                        ) : (
                            <div className="space-y-4">
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
                                            {insumos.data.map((insumo) => (
                                                <tr key={insumo.id} className="border-b hover:bg-muted/50">
                                                    <td className="px-4 py-3">{insumo.nombre}</td>
                                                    <td className="px-4 py-3">
                                                        ${Number(insumo.precio).toFixed(0)}
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

                                {insumos.last_page > 1 && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Mostrando {insumos.data.length} de {insumos.total} insumos
                                        </p>
                                        <div className="flex gap-2">
                                            {insumos.current_page > 1 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.get('/insumos', {
                                                            ...filters,
                                                            page: insumos.current_page - 1,
                                                        })
                                                    }
                                                >
                                                    Anterior
                                                </Button>
                                            )}
                                            {insumos.current_page < insumos.last_page && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.get('/insumos', {
                                                            ...filters,
                                                            page: insumos.current_page + 1,
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
                                        type="number"
                                        step="1"
                                        min="0"
                                        placeholder="0"
                                        value={data.precio}
                                        onChange={(e) => setData('precio', e.target.value)}
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
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Crear Insumo
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal de Edición */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={data.precio || (editingInsumo?.precio ? Math.round(Number(editingInsumo.precio)).toString() : '')}
                                        onChange={(e) => setData('precio', e.target.value)}
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
