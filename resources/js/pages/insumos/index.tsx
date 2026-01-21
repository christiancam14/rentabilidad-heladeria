import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
                    <Link href="/insumos/create">
                        <Button>
                            <PlusIcon className="size-4" />
                            Nuevo Insumo
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
                                                        ${insumo.precio.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline">{insumo.unidad}</Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {new Date(insumo.updated_at).toLocaleDateString('es-ES')}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Link href={`/insumos/${insumo.id}/edit`}>
                                                                <Button variant="ghost" size="icon">
                                                                    <PencilIcon className="size-4" />
                                                                </Button>
                                                            </Link>
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
            </div>
        </AppLayout>
    );
}
