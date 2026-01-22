import { Head, Link, useForm } from '@inertiajs/react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cierres de Mes',
        href: '/cierres-mes',
    },
    {
        title: 'Crear',
        href: '#',
    },
];

const meses = [
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
];

export default function CierresMesCreate() {
    const currentYear = new Date().getFullYear();
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        anio: currentYear.toString(),
        mes: (new Date().getMonth() + 1).toString(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cierres-mes', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Cierre de Mes" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/cierres-mes">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Crear Cierre de Mes</h1>
                        <p className="text-muted-foreground">
                            Registra un nuevo cierre mensual con gastos
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información del Cierre</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre del Cierre (Opcional)</Label>
                                <Input
                                    id="nombre"
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    placeholder="Ej: Cierre Enero 2025"
                                />
                                <InputError message={errors.nombre} />
                                <p className="text-xs text-muted-foreground">
                                    Un nombre descriptivo para identificar este cierre
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="anio">Año *</Label>
                                    <Input
                                        id="anio"
                                        type="number"
                                        min="2000"
                                        max="2100"
                                        value={data.anio}
                                        onChange={(e) => setData('anio', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.anio} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mes">Mes *</Label>
                                    <Select value={data.mes} onValueChange={(value) => setData('mes', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un mes" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {meses.map((mes) => (
                                                <SelectItem key={mes.value} value={mes.value}>
                                                    {mes.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.mes} />
                                </div>

                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/cierres-mes">Cancelar</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creando...' : 'Crear Cierre'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
