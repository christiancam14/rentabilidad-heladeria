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
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Inicializar con valores del insumo si está disponible
    const initialData = insumo ? {
        nombre: insumo.nombre || '',
        precio: insumo.precio ? Math.round(Number(insumo.precio)).toString() : '',
        unidad: insumo.unidad || unidades_disponibles[0] || '',
    } : {
        nombre: '',
        precio: '',
        unidad: unidades_disponibles[0] || '',
    };

    const { data, setData, put, processing, errors } = useForm(initialData);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!insumo) return;
        // Limpiar formato y convertir precio a número entero antes de enviar
        const cleanPrecio = cleanNumberFormat(data.precio as string);
        const precioNumerico = parseInt(cleanPrecio) || 0;
        
        // Enviar datos directamente con el valor limpio
        router.put(`/insumos/${insumo.id}`, {
            nombre: data.nombre,
            precio: precioNumerico,
            unidad: data.unidad,
        }, {
            preserveScroll: true,
        });
    };

    if (!insumo) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Editar Insumo" />
                <div>Cargando...</div>
            </AppLayout>
        );
    }

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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    name="nombre"
                                    value={data.nombre || insumo.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    required
                                />
                                <InputError message={errors.nombre} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="precio">Precio</Label>
                                <Input
                                    id="precio"
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
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
