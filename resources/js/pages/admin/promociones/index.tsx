import { Head, Link, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { Campo } from '@/components/brand/campo';
import { PageHeader, Panel } from '@/components/brand/panel';
import { PillButton, PillLink } from '@/components/brand/pill-button';
import { ProductoFoto } from '@/components/brand/producto-foto';
import { Toggle } from '@/components/brand/toggle';
import ConfirmDialog from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils';

interface Cupon {
    id: number;
    codigo: string;
    descripcion: string | null;
    porcentaje: number;
    activo: boolean;
}

interface Combo {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio: number;
    precio_anterior: number | null;
    visible_menu: boolean;
    imagen_url: string | null;
    color: string;
}

interface Props {
    cupones: Cupon[];
    combos: Combo[];
    combo_destacado_id: number | null;
    cupon_confirmacion: { activo: boolean; codigo: string };
}

export default function Promociones({ cupones, combos, combo_destacado_id, cupon_confirmacion }: Props) {
    const [eliminar, setEliminar] = useState<Cupon | null>(null);
    const form = useForm({ codigo: '', porcentaje: '10', descripcion: '' });

    const crear = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/cupones', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                toast.success('Cupón creado');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Promociones" />
            <PageHeader
                titulo="Promociones"
                descripcion="Combos destacados en el menú y cupones de descuento para tus clientes."
                acciones={
                    <PillLink href="/admin/productos/create" tamano="lg" flecha>
                        Nuevo combo
                    </PillLink>
                }
            />

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                <Panel titulo="Combos" descripcion="Productos con la etiqueta “Combo”. El destacado aparece como tarjeta turquesa arriba del menú.">
                    <div className="flex flex-col gap-3">
                        {combos.map((c) => {
                            const destacado = c.id === combo_destacado_id;
                            return (
                                <div
                                    key={c.id}
                                    className={cn(
                                        'flex items-center gap-4 rounded-[20px] p-4',
                                        destacado ? 'bg-turquesa text-white' : 'border border-tinta/8 bg-hueso',
                                    )}
                                >
                                    <ProductoFoto src={c.imagen_url} color={destacado ? 'blanco' : c.color} className="size-14 shrink-0 rounded-full" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-display truncate text-[17px] font-bold tracking-[-0.02em]">{c.nombre}</p>
                                        <p className={cn('text-sm', destacado ? 'text-white/85' : 'text-tinta/60')}>
                                            {formatPrice(c.precio)}
                                            {c.precio_anterior ? (
                                                <span className="ml-2 line-through opacity-70">{formatPrice(c.precio_anterior)}</span>
                                            ) : null}
                                            {!c.visible_menu && ' · oculto'}
                                        </p>
                                    </div>
                                    <Link href={`/admin/productos/${c.id}/edit`} className="font-display text-[13px] font-bold opacity-70 hover:opacity-100">
                                        Editar
                                    </Link>
                                    <PillButton
                                        tamano="sm"
                                        variante={destacado ? 'suave' : 'tinta'}
                                        onClick={() =>
                                            router.post(
                                                '/admin/promociones/destacado',
                                                { combo_destacado_id: destacado ? null : c.id },
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        {destacado ? '★ Destacado' : 'Destacar'}
                                    </PillButton>
                                </div>
                            );
                        })}
                        {combos.length === 0 && (
                            <p className="rounded-2xl bg-hueso px-4 py-3 text-sm text-tinta/60">
                                Crea un producto con la etiqueta “Combo” y un precio tachado para mostrar el ahorro.
                            </p>
                        )}
                    </div>
                </Panel>

                <Panel titulo="Cupones" descripcion="El cliente los escribe en el carrito.">
                    <div className="flex flex-col divide-y divide-tinta/6">
                        {cupones.map((c) => (
                            <div key={c.id} className="flex items-center gap-3 py-3">
                                <div className="min-w-0 flex-1">
                                    <p className="font-display text-[15px] font-bold tracking-[0.02em]">
                                        {c.codigo} <span className="text-rosa">-{c.porcentaje}%</span>
                                    </p>
                                    <p className="truncate text-xs text-tinta/55">
                                        {c.descripcion || 'Sin descripción'}
                                        {cupon_confirmacion.activo && cupon_confirmacion.codigo === c.codigo && ' · se muestra al confirmar pedido'}
                                    </p>
                                </div>
                                <Toggle
                                    checked={c.activo}
                                    label={`Cupón ${c.codigo} activo`}
                                    onChange={(v) => router.put(`/admin/cupones/${c.id}`, { activo: v }, { preserveScroll: true })}
                                />
                                <button type="button" onClick={() => setEliminar(c)} className="text-tinta/30 hover:text-rosa" aria-label="Eliminar cupón">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={crear} className="mt-4 flex flex-col gap-3 border-t border-tinta/6 pt-4">
                        <div className="grid grid-cols-[1fr_110px] gap-3">
                            <Campo
                                etiqueta="Código"
                                placeholder="VUELVE10"
                                value={form.data.codigo}
                                onChange={(e) => form.setData('codigo', e.target.value.toUpperCase().replace(/\s/g, ''))}
                                error={form.errors.codigo}
                            />
                            <Campo
                                etiqueta="Descuento"
                                inputMode="numeric"
                                sufijo="%"
                                value={form.data.porcentaje}
                                onChange={(e) => form.setData('porcentaje', e.target.value.replace(/\D/g, '').slice(0, 3))}
                                error={form.errors.porcentaje}
                            />
                        </div>
                        <Campo
                            etiqueta="Descripción (opcional)"
                            placeholder="Para tu próxima visita"
                            value={form.data.descripcion}
                            onChange={(e) => form.setData('descripcion', e.target.value)}
                        />
                        <PillButton type="submit" variante="tinta" className="self-end" disabled={form.processing || !form.data.codigo}>
                            Crear cupón
                        </PillButton>
                    </form>
                </Panel>
            </div>

            <ConfirmDialog
                open={!!eliminar}
                onOpenChange={(o) => !o && setEliminar(null)}
                title={`¿Eliminar el cupón ${eliminar?.codigo}?`}
                description="Los clientes ya no podrán usarlo. Si es temporal, mejor desactívalo."
                confirmText="Eliminar"
                variant="destructive"
                onConfirm={() => eliminar && router.delete(`/admin/cupones/${eliminar.id}`, { preserveScroll: true })}
            />
        </AppLayout>
    );
}
