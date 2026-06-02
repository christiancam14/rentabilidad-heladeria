import { Head, router, useForm } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
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

interface Movimiento {
    id: number;
    contexto: string;
    fecha: string;
    no_transferencia: string | null;
    concepto: string;
    valor: number;
}

interface Props {
    periodo: FinanzasPeriodo;
    heladeria: Movimiento[];
    casa: Movimiento[];
    totales: { heladeria: number; casa: number; gastos_mes: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Finanzas', href: '/finanzas/consolidado' },
    { title: 'Tarjeta BBVA', href: '/finanzas/tarjeta-bbva' },
];

function TablaMovimientos({
    titulo,
    contexto,
    items,
    periodo,
    onAdd,
    onEdit,
    onDelete,
}: {
    titulo: string;
    contexto: string;
    items: Movimiento[];
    periodo: FinanzasPeriodo;
    onAdd: () => void;
    onEdit: (m: Movimiento) => void;
    onDelete: (id: number) => void;
}) {
    const total = items.reduce((s, m) => s + m.valor, 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{titulo}</CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatPrice(total)}</span>
                    <Button size="sm" onClick={onAdd}>
                        <PlusIcon className="size-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="p-2">Fecha</th>
                            <th className="p-2">No. transferencia</th>
                            <th className="p-2">Concepto</th>
                            <th className="p-2 text-right">Valor</th>
                            <th className="w-16" />
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-muted-foreground p-3 text-center">Sin movimientos</td>
                            </tr>
                        ) : (
                            items.map((m) => (
                                <tr key={m.id} className="border-b">
                                    <td className="p-2">{m.fecha}</td>
                                    <td className="p-2">{m.no_transferencia ?? '—'}</td>
                                    <td className="p-2">{m.concepto}</td>
                                    <td className="p-2 text-right">{formatPrice(m.valor)}</td>
                                    <td className="p-2">
                                        <div className="flex">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(m)}>
                                                <PencilIcon className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onDelete(m.id)}>
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
    );
}

export default function FinanzasTarjetaBbva({ periodo, heladeria, casa, totales }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Movimiento | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, processing, errors, reset } = useForm({
        contexto: 'heladeria',
        fecha: new Date().toISOString().slice(0, 10),
        no_transferencia: '',
        concepto: '',
        valor: '',
        anio: periodo.anio,
        mes: periodo.mes,
    });

    const openCreate = (contexto: string) => {
        reset();
        setData({
            contexto,
            fecha: new Date().toISOString().slice(0, 10),
            no_transferencia: '',
            concepto: '',
            valor: '',
            anio: periodo.anio,
            mes: periodo.mes,
        });
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (m: Movimiento) => {
        setEditing(m);
        setData({
            contexto: m.contexto,
            fecha: m.fecha,
            no_transferencia: m.no_transferencia ?? '',
            concepto: m.concepto,
            valor: formatNumberWithSeparator(m.valor),
            anio: periodo.anio,
            mes: periodo.mes,
        });
        setDialogOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            contexto: data.contexto,
            fecha: data.fecha,
            no_transferencia: data.no_transferencia || null,
            concepto: data.concepto,
            valor: parseInt(cleanNumberFormat(data.valor), 10) || 0,
            anio: periodo.anio,
            mes: periodo.mes,
        };
        const opts = {
            preserveScroll: true,
            onSuccess: () => { toast.success('Guardado'); setDialogOpen(false); },
        };
        if (editing) {
            router.put(`/finanzas/tarjeta-bbva/${editing.id}`, payload, opts);
        } else {
            router.post('/finanzas/tarjeta-bbva', payload, opts);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tarjeta BBVA - Finanzas" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Tarjeta BBVA</h1>
                        <p className="text-muted-foreground text-sm">Control aparte — no afecta el consolidado</p>
                    </div>
                    <PeriodSelector periodo={periodo} basePath="/finanzas/tarjeta-bbva" />
                </div>

                <FinanzasNav active="/finanzas/tarjeta-bbva" periodo={periodo} />

                <Card>
                    <CardHeader>
                        <CardTitle>Gastos mes (tarjeta)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-6 text-sm">
                        <span>Heladería: <strong>{formatPrice(totales.heladeria)}</strong></span>
                        <span>Casa: <strong>{formatPrice(totales.casa)}</strong></span>
                        <span className="font-semibold">Total: {formatPrice(totales.gastos_mes)}</span>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <TablaMovimientos
                        titulo="Heladería"
                        contexto="heladeria"
                        items={heladeria}
                        periodo={periodo}
                        onAdd={() => openCreate('heladeria')}
                        onEdit={openEdit}
                        onDelete={setDeleteId}
                    />
                    <TablaMovimientos
                        titulo="Casa"
                        contexto="casa"
                        items={casa}
                        periodo={periodo}
                        onAdd={() => openCreate('casa')}
                        onEdit={openEdit}
                        onDelete={setDeleteId}
                    />
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Editar movimiento' : 'Nuevo movimiento'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <input type="hidden" value={data.contexto} />
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <Input type="date" value={data.fecha} onChange={(e) => setData('fecha', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>No. transferencia (opcional)</Label>
                            <Input value={data.no_transferencia} onChange={(e) => setData('no_transferencia', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Concepto</Label>
                            <Input value={data.concepto} onChange={(e) => setData('concepto', e.target.value)} />
                            <InputError message={errors.concepto} />
                        </div>
                        <div className="space-y-2">
                            <Label>Valor</Label>
                            <Input
                                value={data.valor}
                                onChange={(e) => handleNumberInputChange(e.target.value, (v) => setData('valor', v))}
                                onBlur={() => handleNumberInputBlur(data.valor, (v) => setData('valor', v))}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing}>Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(o) => !o && setDeleteId(null)}
                title="Eliminar movimiento"
                description="¿Eliminar este registro?"
                variant="destructive"
                onConfirm={() => {
                    if (deleteId) {
                        router.delete(
                            `/finanzas/tarjeta-bbva/${deleteId}?anio=${periodo.anio}&mes=${periodo.mes}`,
                            { preserveScroll: true, onSuccess: () => { toast.success('Eliminado'); setDeleteId(null); } },
                        );
                    }
                }}
            />
        </AppLayout>
    );
}
