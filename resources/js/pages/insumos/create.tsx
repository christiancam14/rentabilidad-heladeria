import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

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
import { formatNumberWithSeparator, cleanNumberFormat, handleNumberInputChange, handleNumberInputBlur } from '@/lib/number-format';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Limpiar formato y convertir precio a número entero antes de enviar
        const cleanPrecio = cleanNumberFormat(data.precio as string);
        const precioNumerico = parseInt(cleanPrecio) || 0;
        
        // Enviar datos directamente con el valor limpio
        router.post('/insumos', {
            nombre: data.nombre,
            precio: precioNumerico,
            unidad: data.unidad,
        }, {
            preserveScroll: true,
        });
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
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    name="nombre"
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
                                    type="text"
                                    name="precio"
                                    value={data.precio}
                                    onChange={(e) => handleNumberInputChange(e.target.value, (val) => setData('precio', val))}
                                    onBlur={(e) => handleNumberInputBlur(e.target.value, (val) => setData('precio', val))}
                                    placeholder="0"
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
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
