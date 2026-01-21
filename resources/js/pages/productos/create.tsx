import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: '/productos',
    },
    {
        title: 'Crear',
        href: '/productos/create',
    },
];

export default function ProductosCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        precio_venta_publico: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convertir precio a número entero antes de enviar
        setData('precio_venta_publico', String(parseInt(data.precio_venta_publico) || 0));
        post('/productos', {
            preserveScroll: true,
            onSuccess: () => {
                // La redirección se maneja en el controlador
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Producto" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/productos">
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold">Crear Producto</h1>
                        <p className="text-muted-foreground">
                            Agrega un nuevo producto a tu heladería
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
                                    placeholder="Ej: Helado de Vainilla, Helado de Chocolate..."
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
                                    placeholder="0"
                                    required
                                />
                                <InputError message={errors.precio_venta_publico} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link href="/productos">
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Crear Producto
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
