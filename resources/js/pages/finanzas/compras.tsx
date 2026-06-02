import { Head, router, useForm } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import ConfirmDialog from '@/components/confirm-dialog';
import FinanzasNav from '@/components/finanzas/finanzas-nav';
import PeriodSelector from '@/components/finanzas/period-selector';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatPrice, type FinanzasPeriodo } from '@/lib/format-price';
import {
    cleanNumberFormat,
    formatNumberWithSeparator,
    handleNumberInputBlur,
    handleNumberInputChange,
} from '@/lib/number-format';
import { type BreadcrumbItem } from '@/types';

interface Compra {
    id: number;
    fecha: string;
    nombre: string;
    descripcion: string | null;
    efectivo: number;
    transferencia: number;
    total: number;
}

interface Props {
    periodo: FinanzasPeriodo;
    compras: Compra[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Finanzas', href: '/finanzas/consolidado' },
    { title: 'Compras', href: '/finanzas/compras' },
];

export default function FinanzasCompras({ periodo, compras }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Compra | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, processing, errors, reset } = useForm({
        fecha: new Date().toISOString().slice(0, 10),
        nombre: '',
        descripcion: '',
        efectivo: '',
        transferencia: '',
        anio: periodo.anio,
        mes: periodo.mes,
    });

    const openCreate = () => {
        reset();
        setData({
            fecha: new Date().toISOString().slice(0, 10),
            nombre: '',
            descripcion: '',
            efectivo: '',
            transferencia: '',
            anio: periodo.anio,
            mes: periodo.mes,
        });
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (c: Compra) => {
        setEditing(c);
        setData({
            fecha: c.fecha,
            nombre: c.nombre,
            descripcion: c.descripcion ?? '',
            efectivo: formatNumberWithSeparator(c.efectivo),
            transferencia: formatNumberWithSeparator(c.transferencia),
            anio: periodo.anio,
            mes: periodo.mes,
        });
        setDialogOpen(true);
    };

    useEffect(() => {
        setData('anio', periodo.anio);
        setData('mes', periodo.mes);
    }, [periodo.anio, periodo.mes]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            fecha: data.fecha,
            nombre: data.nombre,
            descripcion: data.descripcion || null,
            efectivo: parseInt(cleanNumberFormat(data.efectivo), 10) || 0,
            transferencia: parseInt(cleanNumberFormat(data.transferencia), 10) || 0,
            anio: periodo.anio,
            mes: periodo.mes,
        };
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(editing ? 'Compra actualizada' : 'Compra registrada');
                setDialogOpen(false);
            },
        };
        if (editing) {
            router.put(`/finanzas/compras/${editing.id}`, payload, opts);
        } else {
            router.post('/finanzas/compras', payload, opts);
        }
    };

    const totalMes = compras.reduce((s, c) => s + c.total, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compras - Finanzas" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Compras</h1>
                        <p className="text-muted-foreground text-sm">Globales para ambas sedes</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <PeriodSelector periodo={periodo} basePath="/finanzas/compras" />
                        <Button onClick={openCreate}>
                            <PlusIcon className="mr-2 size-4" />
                            Agregar
                        </Button>
                    </div>
                </div>

                <FinanzasNav active="/finanzas/compras" periodo={periodo} />

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Registros del mes</CardTitle>
                        <span className="text-sm font-medium">Total: {formatPrice(totalMes)}</span>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">Fecha</th>
                                    <th className="p-2">Nombre</th>
                                    <th className="p-2 text-right">Efectivo</th>
                                    <th className="p-2 text-right">Transfer.</th>
                                    <th className="p-2 text-right">Total</th>
                                    <th className="p-2 w-20" />
                                </tr>
                            </thead>
                            <tbody>
                                {compras.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-muted-foreground p-4 text-center">
                                            Sin compras este mes
                                        </td>
                                    </tr>
                                ) : (
                                    compras.map((c) => (
                                        <tr key={c.id} className="border-b">
                                            <td className="p-2">{c.fecha}</td>
                                            <td className="p-2">{c.nombre}</td>
                                            <td className="p-2 text-right">{formatPrice(c.efectivo)}</td>
                                            <td className="p-2 text-right">{formatPrice(c.transferencia)}</td>
                                            <td className="p-2 text-right font-medium">{formatPrice(c.total)}</td>
                                            <td className="p-2">
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                                                        <PencilIcon className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)}>
                                                        <TrashIcon className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Editar compra' : 'Nueva compra'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <Input type="date" value={data.fecha} onChange={(e) => setData('fecha', e.target.value)} />
                            <InputError message={errors.fecha} />
                        </div>
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} />
                            <InputError message={errors.nombre} />
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción (opcional)</Label>
                            <Input value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Efectivo</Label>
                                <Input
                                    value={data.efectivo}
                                    onChange={(e) => handleNumberInputChange(e.target.value, (v) => setData('efectivo', v))}
                                    onBlur={() => handleNumberInputBlur(data.efectivo, (v) => setData('efectivo', v))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Transferencia</Label>
                                <Input
                                    value={data.transferencia}
                                    onChange={(e) => handleNumberInputChange(e.target.value, (v) => setData('transferencia', v))}
                                    onBlur={() => handleNumberInputBlur(data.transferencia, (v) => setData('transferencia', v))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Eliminar compra"
                description="¿Eliminar este registro?"
                variant="destructive"
                onConfirm={() => {
                    if (deleteId) {
                        router.delete(
                            `/finanzas/compras/${deleteId}?anio=${periodo.anio}&mes=${periodo.mes}`,
                            { preserveScroll: true, onSuccess: () => { toast.success('Eliminado'); setDeleteId(null); } },
                        );
                    }
                }}
            />
        </AppLayout>
    );
}
