import { router } from '@inertiajs/react';

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MESES, type FinanzasPeriodo } from '@/lib/format-price';

interface Props {
    periodo: FinanzasPeriodo;
    basePath: string;
    extraParams?: Record<string, string | number>;
}

export default function PeriodSelector({ periodo, basePath, extraParams = {} }: Props) {
    const navigate = (anio: number, mes: number) => {
        router.get(basePath, { anio, mes, ...extraParams }, { preserveState: false });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i + 1);

    return (
        <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
                <Label>Mes</Label>
                <Select
                    value={String(periodo.mes)}
                    onValueChange={(v) => navigate(periodo.anio, parseInt(v, 10))}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {MESES.map((m) => (
                            <SelectItem key={m.value} value={String(m.value)}>
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label>Año</Label>
                <Select
                    value={String(periodo.anio)}
                    onValueChange={(v) => navigate(parseInt(v, 10), periodo.mes)}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
