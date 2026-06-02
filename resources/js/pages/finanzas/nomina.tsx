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

interface SemanaData {
    semana: number;
    id?: number;
    dias_turno_completo: number;
    valor_turno_completo: number;
    dias_medio_turno: number;
    valor_medio_turno: number;
    pago_semana: number;
}

interface FilaNomina {
    id: number;
    nombre: string;
    valor_turno_completo_default: number | null;
    valor_medio_turno_default: number | null;
    semanas: SemanaData[];
    total_mes: number;
}

interface Props {
    periodo: FinanzasPeriodo;
    filas: FilaNomina[];
    total_nomina: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Finanzas', href: '/finanzas/consolidado' },
    { title: 'Nómina', href: '/finanzas/nomina' },
];

export default function FinanzasNomina({ periodo, filas, total_nomina }: Props) {
    const [empleadoDialog, setEmpleadoDialog] = useState(false);
    const [semanaDialog, setSemanaDialog] = useState(false);
    const [editingEmpleado, setEditingEmpleado] = useState<FilaNomina | null>(null);
    const [semanaCtx, setSemanaCtx] = useState<{ empleado: FilaNomina; semana: SemanaData } | null>(null);
    const [deleteEmpleadoId, setDeleteEmpleadoId] = useState<number | null>(null);

    const empleadoForm = useForm({
        nombre: '',
        valor_turno_completo: '',
        valor_medio_turno: '',
        anio: periodo.anio,
        mes: periodo.mes,
    });

    const semanaForm = useForm({
        empleado_id: 0,
        semana: 1,
        dias_turno_completo: '',
        valor_turno_completo: '',
        dias_medio_turno: '',
        valor_medio_turno: '',
        anio: periodo.anio,
        mes: periodo.mes,
    });

    const openEmpleado = (fila?: FilaNomina) => {
        setEditingEmpleado(fila ?? null);
        empleadoForm.setData({
            nombre: fila?.nombre ?? '',
            valor_turno_completo: fila?.valor_turno_completo_default
                ? formatNumberWithSeparator(fila.valor_turno_completo_default)
                : '',
            valor_medio_turno: fila?.valor_medio_turno_default
                ? formatNumberWithSeparator(fila.valor_medio_turno_default)
                : '',
            anio: periodo.anio,
            mes: periodo.mes,
        });
        setEmpleadoDialog(true);
    };

    const openSemana = (empleado: FilaNomina, semana: SemanaData) => {
        setSemanaCtx({ empleado, semana });
        semanaForm.setData({
            empleado_id: empleado.id,
            semana: semana.semana,
            dias_turno_completo: String(semana.dias_turno_completo || ''),
            valor_turno_completo: formatNumberWithSeparator(
                semana.valor_turno_completo || empleado.valor_turno_completo_default || 0,
            ),
            dias_medio_turno: String(semana.dias_medio_turno || ''),
            valor_medio_turno: formatNumberWithSeparator(
                semana.valor_medio_turno || empleado.valor_medio_turno_default || 0,
            ),
            anio: periodo.anio,
            mes: periodo.mes,
        });
        setSemanaDialog(true);
    };

    const submitEmpleado = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            nombre: empleadoForm.data.nombre,
            valor_turno_completo: empleadoForm.data.valor_turno_completo
                ? parseInt(cleanNumberFormat(empleadoForm.data.valor_turno_completo), 10)
                : null,
            valor_medio_turno: empleadoForm.data.valor_medio_turno
                ? parseInt(cleanNumberFormat(empleadoForm.data.valor_medio_turno), 10)
                : null,
            anio: periodo.anio,
            mes: periodo.mes,
        };
        const opts = { preserveScroll: true, onSuccess: () => { toast.success('Guardado'); setEmpleadoDialog(false); } };
        if (editingEmpleado) {
            router.put(`/finanzas/nomina/empleados/${editingEmpleado.id}`, payload, opts);
        } else {
            router.post('/finanzas/nomina/empleados', payload, opts);
        }
    };

    const submitSemana = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            '/finanzas/nomina/semanas',
            {
                empleado_id: semanaForm.data.empleado_id,
                semana: semanaForm.data.semana,
                dias_turno_completo: parseInt(semanaForm.data.dias_turno_completo, 10) || 0,
                valor_turno_completo: parseInt(cleanNumberFormat(semanaForm.data.valor_turno_completo), 10) || 0,
                dias_medio_turno: parseInt(semanaForm.data.dias_medio_turno, 10) || 0,
                valor_medio_turno: parseInt(cleanNumberFormat(semanaForm.data.valor_medio_turno), 10) || 0,
                anio: periodo.anio,
                mes: periodo.mes,
            },
            { preserveScroll: true, onSuccess: () => { toast.success('Semana guardada'); setSemanaDialog(false); } },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nómina - Finanzas" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Nómina</h1>
                        <p className="text-muted-foreground text-sm">
                            Turno completo + medio turno por semana. Sueldo fijo: cargar el monto en una sola semana.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <PeriodSelector periodo={periodo} basePath="/finanzas/nomina" />
                        <Button onClick={() => openEmpleado()}>
                            <PlusIcon className="mr-2 size-4" />
                            Empleado
                        </Button>
                    </div>
                </div>

                <FinanzasNav active="/finanzas/nomina" periodo={periodo} />

                <Card>
                    <CardHeader className="flex flex-row justify-between">
                        <CardTitle>Empleados</CardTitle>
                        <span className="font-medium">Total mes: {formatPrice(total_nomina)}</span>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-xs md:text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2 text-left">Empleado</th>
                                    {[1, 2, 3, 4].map((s) => (
                                        <th key={s} className="p-2 text-center">Sem. {s}</th>
                                    ))}
                                    <th className="p-2 text-right">Total mes</th>
                                    <th className="p-2 w-16" />
                                </tr>
                            </thead>
                            <tbody>
                                {filas.map((fila) => (
                                    <tr key={fila.id} className="border-b">
                                        <td className="p-2 font-medium">{fila.nombre}</td>
                                        {fila.semanas.map((sem) => (
                                            <td key={sem.semana} className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    className="hover:bg-muted w-full rounded px-1 py-1"
                                                    onClick={() => openSemana(fila, sem)}
                                                >
                                                    {sem.pago_semana > 0 ? formatPrice(sem.pago_semana) : '—'}
                                                </button>
                                            </td>
                                        ))}
                                        <td className="p-2 text-right font-semibold">{formatPrice(fila.total_mes)}</td>
                                        <td className="p-2">
                                            <div className="flex gap-0">
                                                <Button variant="ghost" size="icon" onClick={() => openEmpleado(fila)}>
                                                    <PencilIcon className="size-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteEmpleadoId(fila.id)}>
                                                    <TrashIcon className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={empleadoDialog} onOpenChange={setEmpleadoDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEmpleado ? 'Editar empleado' : 'Nuevo empleado'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEmpleado} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input value={empleadoForm.data.nombre} onChange={(e) => empleadoForm.setData('nombre', e.target.value)} />
                            <InputError message={empleadoForm.errors.nombre} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Valor turno completo (def.)</Label>
                                <Input
                                    value={empleadoForm.data.valor_turno_completo}
                                    onChange={(e) => handleNumberInputChange(e.target.value, (v) => empleadoForm.setData('valor_turno_completo', v))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Valor medio turno (def.)</Label>
                                <Input
                                    value={empleadoForm.data.valor_medio_turno}
                                    onChange={(e) => handleNumberInputChange(e.target.value, (v) => empleadoForm.setData('valor_medio_turno', v))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={empleadoForm.processing}>Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={semanaDialog} onOpenChange={setSemanaDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {semanaCtx?.empleado.nombre} — Semana {semanaCtx?.semana.semana}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitSemana} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Días turno completo</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={semanaForm.data.dias_turno_completo}
                                    onChange={(e) => semanaForm.setData('dias_turno_completo', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Valor turno completo</Label>
                                <Input
                                    value={semanaForm.data.valor_turno_completo}
                                    onChange={(e) => handleNumberInputChange(e.target.value, (v) => semanaForm.setData('valor_turno_completo', v))}
                                    onBlur={() => handleNumberInputBlur(semanaForm.data.valor_turno_completo, (v) => semanaForm.setData('valor_turno_completo', v))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Días medio turno</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={semanaForm.data.dias_medio_turno}
                                    onChange={(e) => semanaForm.setData('dias_medio_turno', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Valor medio turno</Label>
                                <Input
                                    value={semanaForm.data.valor_medio_turno}
                                    onChange={(e) => handleNumberInputChange(e.target.value, (v) => semanaForm.setData('valor_medio_turno', v))}
                                    onBlur={() => handleNumberInputBlur(semanaForm.data.valor_medio_turno, (v) => semanaForm.setData('valor_medio_turno', v))}
                                />
                            </div>
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Pago = (días TC × valor TC) + (días MT × valor MT). Para sueldo fijo: pon el monto en valor TC con 1 día o solo valores.
                        </p>
                        <DialogFooter>
                            <Button type="submit" disabled={semanaForm.processing}>Guardar semana</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteEmpleadoId !== null}
                onOpenChange={(o) => !o && setDeleteEmpleadoId(null)}
                title="Desactivar empleado"
                description="El empleado dejará de mostrarse en la nómina."
                variant="destructive"
                onConfirm={() => {
                    if (deleteEmpleadoId) {
                        router.delete(
                            `/finanzas/nomina/empleados/${deleteEmpleadoId}?anio=${periodo.anio}&mes=${periodo.mes}`,
                            { preserveScroll: true, onSuccess: () => { toast.success('Desactivado'); setDeleteEmpleadoId(null); } },
                        );
                    }
                }}
            />
        </AppLayout>
    );
}
