import { Form, Head, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';

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
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Insumo {
    id: number;
    nombre: string;
    precio: number;
    unidad: string;
}

interface Props {
    insumo: Insumo;
    unidades_disponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Insumos',
        href: '/insumos',
    },
    {
        title: 'Editar',
        href: '#',
    },
];

export default function InsumosEdit({ insumo, unidades_disponibles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: insumo.nombre,
        precio: insumo.precio.toString(),
        unidad: insumo.unidad,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/insumos/${insumo.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Insumo" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/insumos">
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold">Editar Insumo</h1>
                        <p className="text-muted-foreground">
                            Modifica la información del insumo
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información del Insumo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    required
                                />
                                <InputError message={errors.nombre} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="precio">Precio</Label>
                                <Input
                                    id="precio"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.precio}
                                    onChange={(e) => setData('precio', e.target.value)}
                                    required
                                />
                                <InputError message={errors.precio} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unidad">Unidad</Label>
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

                            <div className="flex justify-end gap-2">
                                <Link href="/insumos">
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Guardar Cambios
                                </Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
