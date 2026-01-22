import { Head, Link, router, useForm } from '@inertiajs/react';
import { PlusIcon, EyeIcon, TrashIcon, CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface CierreMes {
    id: number;
    nombre: string | null;
    anio: number;
    mes: number;
    total_gastos?: number;
    ingresos?: number;
    costos?: number;
    ganancia_bruta?: number;
    ganancia_neta?: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    cierres: {
        data: CierreMes[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    anios: number[];
    filters: {
        anio?: number;
        per_page?: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cierres de Mes',
        href: '/cierres-mes',
    },
];

// Función helper para formatear precios con separador de miles (punto)
const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return '$0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    if (isNaN(numPrice)) return '$0';
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

// Función helper para obtener nombre del mes
const getNombreMes = (mes: number): string => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || '';
};

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

export default function CierresMesIndex({ cierres, anios, filters }: Props) {
    const [selectedAnio, setSelectedAnio] = useState<string>(filters.anio?.toString() || 'all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    
    const currentYear = new Date().getFullYear();
    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
        anio: currentYear.toString(),
        mes: (new Date().getMonth() + 1).toString(),
    });

    const handleFilterChange = (anio: string) => {
        setSelectedAnio(anio);
        router.get('/cierres-mes', { anio: anio === 'all' ? null : anio }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number, periodo: string) => {
        if (confirm(`¿Está seguro de que desea eliminar el cierre de ${periodo}?`)) {
            router.delete(`/cierres-mes/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cierres-mes', {
            preserveScroll: true,
            onSuccess: () => {
                setCreateDialogOpen(false);
                reset();
            },
        });
    };

    const openCreateDialog = () => {
        reset();
        setData('anio', currentYear.toString());
        setData('mes', (new Date().getMonth() + 1).toString());
        setCreateDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cierres de Mes" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Cierres de Mes</h1>
                        <p className="text-muted-foreground">
                            Gestión de cierres mensuales y rentabilidad
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Nuevo Cierre
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Cierres Registrados</CardTitle>
                            <div className="flex items-center gap-2">
                                <Select value={selectedAnio} onValueChange={handleFilterChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Todos los años" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los años</SelectItem>
                                        {anios.map((anio) => (
                                            <SelectItem key={anio} value={anio.toString()}>
                                                {anio}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {cierres.data.length === 0 ? (
                            <div className="text-center py-12">
                                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No hay cierres registrados</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Comienza creando tu primer cierre de mes.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2 font-medium">Período</th>
                                                <th className="text-right p-2 font-medium">Ingresos</th>
                                                <th className="text-right p-2 font-medium">Costos</th>
                                                <th className="text-right p-2 font-medium">Gastos</th>
                                                <th className="text-right p-2 font-medium">Ganancia Bruta</th>
                                                <th className="text-right p-2 font-medium">Ganancia Neta</th>
                                                <th className="text-right p-2 font-medium">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cierres.data.map((cierre) => {
                                                const periodo = `${getNombreMes(cierre.mes)} ${cierre.anio}`;
                                                return (
                                                    <tr key={cierre.id} className="border-b hover:bg-muted/50">
                                                        <td className="p-2">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                                <div>
                                                                    {cierre.nombre ? (
                                                                        <div>
                                                                            <span className="font-medium">{toCamelCase(cierre.nombre)}</span>
                                                                            <span className="text-sm text-muted-foreground ml-2">({periodo})</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="font-medium">{periodo}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-right p-2">
                                                            {formatPrice(cierre.ingresos)}
                                                        </td>
                                                        <td className="text-right p-2">
                                                            {formatPrice(cierre.costos)}
                                                        </td>
                                                        <td className="text-right p-2">
                                                            {formatPrice(cierre.total_gastos || 0)}
                                                        </td>
                                                        <td className="text-right p-2">
                                                            <Badge
                                                                variant={
                                                                    (cierre.ganancia_bruta || 0) >= 0
                                                                        ? 'default'
                                                                        : 'destructive'
                                                                }
                                                            >
                                                                {formatPrice(cierre.ganancia_bruta)}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-right p-2">
                                                            <Badge
                                                                variant={
                                                                    (cierre.ganancia_neta || 0) >= 0
                                                                        ? 'default'
                                                                        : 'destructive'
                                                                }
                                                            >
                                                                {formatPrice(cierre.ganancia_neta)}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-right p-2">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link href={`/cierres-mes/${cierre.id}`}>
                                                                        <EyeIcon className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(cierre.id, periodo)}
                                                                >
                                                                    <TrashIcon className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                {cierres.last_page > 1 && (
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Mostrando {cierres.data.length} de {cierres.total} cierres
                                        </div>
                                        <div className="flex gap-2">
                                            {cierres.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal de Creación */}
                <Dialog open={createDialogOpen} onOpenChange={(open) => {
                    if (!processing) {
                        setCreateDialogOpen(open);
                        if (!open) {
                            reset();
                        }
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Cierre de Mes</DialogTitle>
                            <DialogDescription>
                                Registra un nuevo cierre mensual con gastos
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="create_nombre">Nombre del Cierre (Opcional)</Label>
                                    <Input
                                        id="create_nombre"
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="create_anio">Año *</Label>
                                        <Input
                                            id="create_anio"
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
                                        <Label htmlFor="create_mes">Mes *</Label>
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
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setCreateDialogOpen(false);
                                        reset();
                                    }}
                                    disabled={processing}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creando...' : 'Crear Cierre'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
