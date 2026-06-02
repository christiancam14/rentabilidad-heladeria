import { Head, router, useForm } from '@inertiajs/react';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import ConfirmDialog from '@/components/confirm-dialog';
import FinanzasNav from '@/components/finanzas/finanzas-nav';
import PeriodSelector from '@/components/finanzas/period-selector';
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatPrice, type FinanzasPeriodo } from '@/lib/format-price';
import {
    cleanNumberFormat,
    formatNumberWithSeparator,
    handleNumberInputBlur,
    handleNumberInputChange,
} from '@/lib/number-format';
import { type BreadcrumbItem } from '@/types';

interface Concepto {
    id: number;
    nombre: string;
    valor: number;
}

interface Sede {
    id: number;
    nombre: string;
}

interface Props {
    periodo: FinanzasPeriodo;
    sedes: Sede[];
    sede_id: number;
    conceptos: Concepto[];
    total_sede: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Finanzas', href: '/finanzas/consolidado' },
    { title: 'Gastos fijos', href: '/finanzas/gastos-fijos' },
];

export default function FinanzasGastosFijos({ periodo, sedes, sede_id, conceptos, total_sede }: Props) {
    const [conceptoDialog, setConceptoDialog] = useState(false);
    const [deleteConceptoId, setDeleteConceptoId] = useState<number | null>(null);
    const [valores, setValores] = useState<Record<number, string>>(
        Object.fromEntries(conceptos.map((c) => [c.id, formatNumberWithSeparator(c.valor)])),
    );

    const conceptoForm = useForm({ nombre: '', sede_id: sede_id, anio: periodo.anio, mes: periodo.mes });

    const changeSede = (id: string) => {
        router.get('/finanzas/gastos-fijos', { anio: periodo.anio, mes: periodo.mes, sede_id: id });
    };

    const guardarValor = (conceptoId: number) => {
        const valor = parseInt(cleanNumberFormat(valores[conceptoId] ?? '0'), 10) || 0;
        router.post(
            '/finanzas/gastos-fijos/valores',
            {
                concepto_gasto_fijo_id: conceptoId,
                valor,
                sede_id,
                anio: periodo.anio,
                mes: periodo.mes,
            },
            { preserveScroll: true, onSuccess: () => toast.success('Valor guardado') },
        );
    };

    const agregarConcepto = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            '/finanzas/gastos-fijos/conceptos',
            { nombre: conceptoForm.data.nombre, sede_id, anio: periodo.anio, mes: periodo.mes },
            { preserveScroll: true, onSuccess: () => { toast.success('Concepto agregado'); setConceptoDialog(false); conceptoForm.reset(); } },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gastos fijos - Finanzas" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Gastos fijos</h1>
                        <p className="text-muted-foreground text-sm">Por sede — arriendo, servicios, etc.</p>
                    </div>
                    <PeriodSelector
                        periodo={periodo}
                        basePath="/finanzas/gastos-fijos"
                        extraParams={{ sede_id }}
                    />
                </div>

                <FinanzasNav active="/finanzas/gastos-fijos" periodo={periodo} />

                <div className="flex flex-wrap items-center gap-4">
                    <div className="space-y-1">
                        <Label>Sede</Label>
                        <Select value={String(sede_id)} onValueChange={changeSede}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {sedes.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="mt-6" onClick={() => { conceptoForm.setData('nombre', ''); setConceptoDialog(true); }}>
                        <PlusIcon className="mr-2 size-4" />
                        Nuevo concepto
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row justify-between">
                        <CardTitle>{sedes.find((s) => s.id === sede_id)?.nombre}</CardTitle>
                        <span className="font-medium">Total sede: {formatPrice(total_sede)}</span>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {conceptos.map((c) => (
                            <div key={c.id} className="flex flex-wrap items-center gap-2 border-b pb-3">
                                <span className="min-w-[140px] flex-1 font-medium">{c.nombre}</span>
                                <Input
                                    className="w-[160px]"
                                    value={valores[c.id] ?? ''}
                                    onChange={(e) => handleNumberInputChange(e.target.value, (v) =>
                                        setValores((prev) => ({ ...prev, [c.id]: v })),
                                    )}
                                    onBlur={() => handleNumberInputBlur(valores[c.id] ?? '', (v) =>
                                        setValores((prev) => ({ ...prev, [c.id]: v })),
                                    )}
                                />
                                <Button size="sm" variant="secondary" onClick={() => guardarValor(c.id)}>
                                    Guardar
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => setDeleteConceptoId(c.id)}>
                                    <TrashIcon className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={conceptoDialog} onOpenChange={setConceptoDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Nuevo gasto fijo</DialogTitle></DialogHeader>
                    <form onSubmit={agregarConcepto} className="space-y-4">
                        <Input
                            placeholder="Nombre (ej. Parqueadero)"
                            value={conceptoForm.data.nombre}
                            onChange={(e) => conceptoForm.setData('nombre', e.target.value)}
                        />
                        <DialogFooter>
                            <Button type="submit">Agregar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteConceptoId !== null}
                onOpenChange={(o) => !o && setDeleteConceptoId(null)}
                title="Eliminar concepto"
                description="Se borrarán también los valores históricos de este concepto."
                variant="destructive"
                onConfirm={() => {
                    if (deleteConceptoId) {
                        router.delete(
                            `/finanzas/gastos-fijos/conceptos/${deleteConceptoId}?anio=${periodo.anio}&mes=${periodo.mes}&sede_id=${sede_id}`,
                            { preserveScroll: true, onSuccess: () => { toast.success('Eliminado'); setDeleteConceptoId(null); } },
                        );
                    }
                }}
            />
        </AppLayout>
    );
}
