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

interface Props {
    unidades_disponibles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Insumos',
        href: '/insumos',
    },
    {
        title: 'Crear',
        href: '/insumos/create',
    },
];

export default function InsumosCreate({ unidades_disponibles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        precio: '',
        unidad: unidades_disponibles[0] || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/insumos');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Insumo" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/insumos">
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold">Crear Insumo</h1>
                        <p className="text-muted-foreground">
                            Agrega un nuevo insumo o materia prima
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
                                    placeholder="Ej: Leche, Azúcar, Vainilla..."
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
                                    placeholder="0.00"
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
                                        <SelectValue placeholder="Selecciona una unidad" />
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
                                    Crear Insumo
                                </Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
