import { Head, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Producto {
    id: number;
    nombre: string;
    precio_venta_publico: number;
}

interface Props {
    producto: Producto;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: '/productos',
    },
    {
        title: 'Editar',
        href: '#',
    },
];

export default function ProductosEdit({ producto }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: producto.nombre,
        precio_venta_publico: Math.round(Number(producto.precio_venta_publico)).toString(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/productos/${producto.id}`, {
            data: {
                nombre: data.nombre,
                precio_venta_publico: parseInt(data.precio_venta_publico) || 0,
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Producto" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/productos/${producto.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold">Editar Producto</h1>
                        <p className="text-muted-foreground">
                            Modifica la información del producto
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información del Producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                <Label htmlFor="precio_venta_publico">Precio de Venta Público</Label>
                                <Input
                                    id="precio_venta_publico"
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={data.precio_venta_publico}
                                    onChange={(e) => setData('precio_venta_publico', e.target.value)}
                                    required
                                />
                                <InputError message={errors.precio_venta_publico} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link href={`/productos/${producto.id}`}>
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
