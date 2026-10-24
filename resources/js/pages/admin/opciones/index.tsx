import { Head, router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { Campo } from '@/components/brand/campo';
import { PageHeader, Panel } from '@/components/brand/panel';
import { PillButton } from '@/components/brand/pill-button';
import { Toggle } from '@/components/brand/toggle';
import ConfirmDialog from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Opcion {
    id: number;
    tipo: 'sabor' | 'adicional';
    nombre: string;
    precio: number;
    disponible: boolean;
    productos: number;
}

const soloDigitos = (v: string) => v.replace(/[^\d]/g, '');

/** Biblioteca de sabores y adicionales compartida por todos los productos. */
export default function SaboresYAdicionales({ sabores, adicionales }: { sabores: Opcion[]; adicionales: Opcion[] }) {
    const [eliminar, setEliminar] = useState<Opcion | null>(null);

    const actualizar = (o: Opcion, data: Partial<Opcion>) => router.put(`/admin/opciones/${o.id}`, data, { preserveScroll: true });

    return (
        <AppLayout>
            <Head title="Sabores y adicionales" />
            <PageHeader
                titulo="Sabores y adicionales"
                descripcion="¿Se acabó un sabor? Apágalo aquí y desaparece de todos los productos al instante."
            />

            <div className="grid items-start gap-5 xl:grid-cols-2">
                <Panel titulo="Sabores de helado" descripcion={`${sabores.filter((s) => s.disponible).length} de ${sabores.length} disponibles hoy`}>
                    <div className="flex flex-wrap gap-2">
                        {sabores.map((s) => (
                            <span
                                key={s.id}
                                className={cn(
                                    'group inline-flex h-[43px] items-center gap-2 rounded-full pr-2 pl-[18px] text-base font-medium transition-colors',
                                    s.disponible ? 'bg-turquesa-suave' : 'bg-tinta/5 text-tinta/45 line-through',
                                )}
                            >
                                <button
                                    type="button"
                                    title={s.disponible ? 'Marcar agotado' : 'Marcar disponible'}
                                    onClick={() => actualizar(s, { disponible: !s.disponible })}
                                >
                                    {s.nombre}
                                </button>
                                <button
                                    type="button"
                                    aria-label={`Eliminar ${s.nombre}`}
                                    onClick={() => setEliminar(s)}
                                    className="grid size-7 place-items-center rounded-full text-tinta/30 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white hover:text-rosa focus:opacity-100"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-tinta/50">Toca un sabor para marcarlo agotado o disponible.</p>
                    <NuevaOpcion tipo="sabor" />
                </Panel>

                <Panel titulo="Adicionales" descripcion="Se cobran aparte. Muestra siempre el precio para que la suma sea transparente.">
                    <div className="flex flex-col divide-y divide-tinta/6">
                        {adicionales.map((a) => (
                            <FilaAdicional key={a.id} opcion={a} onActualizar={(d) => actualizar(a, d)} onEliminar={() => setEliminar(a)} />
                        ))}
                        {adicionales.length === 0 && <p className="py-3 text-sm text-tinta/55">Aún no hay adicionales.</p>}
                    </div>
                    <NuevaOpcion tipo="adicional" />
                </Panel>
            </div>

            <ConfirmDialog
                open={!!eliminar}
                onOpenChange={(o) => !o && setEliminar(null)}
                title={`¿Eliminar "${eliminar?.nombre}"?`}
                description={
                    eliminar?.productos
                        ? `Se quitará de ${eliminar.productos} productos. Si solo se acabó por hoy, mejor márcalo como agotado.`
                        : 'No está en ningún producto.'
                }
                confirmText="Eliminar"
                variant="destructive"
                onConfirm={() => eliminar && router.delete(`/admin/opciones/${eliminar.id}`, { preserveScroll: true })}
            />
        </AppLayout>
    );
}

function FilaAdicional({
    opcion,
    onActualizar,
    onEliminar,
}: {
    opcion: Opcion;
    onActualizar: (d: Partial<Opcion>) => void;
    onEliminar: () => void;
}) {
    const [precio, setPrecio] = useState(String(opcion.precio));

    return (
        <div className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
                <p className={cn('text-[15px] font-medium', !opcion.disponible && 'text-tinta/45 line-through')}>{opcion.nombre}</p>
                <p className="text-xs text-tinta/50">En {opcion.productos} productos</p>
            </div>
            <label className="flex h-10 w-[136px] shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border border-tinta/12 bg-white px-3 focus-within:border-turquesa">
                <span className="text-sm text-tinta/50">+ $</span>
                <input
                    inputMode="numeric"
                    value={precio.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    onChange={(e) => setPrecio(soloDigitos(e.target.value))}
                    onBlur={() => Number(precio) !== opcion.precio && onActualizar({ precio: Number(precio || 0) })}
                    className="w-full bg-transparent text-sm font-bold outline-none"
                    aria-label={`Precio de ${opcion.nombre}`}
                />
            </label>
            <Toggle checked={opcion.disponible} label={`${opcion.nombre} disponible`} onChange={(v) => onActualizar({ disponible: v })} />
            <button type="button" onClick={onEliminar} aria-label={`Eliminar ${opcion.nombre}`} className="text-tinta/30 hover:text-rosa">
                <Trash2 className="size-4" />
            </button>
        </div>
    );
}

function NuevaOpcion({ tipo }: { tipo: 'sabor' | 'adicional' }) {
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [error, setError] = useState<string>();

    const crear = (e: FormEvent) => {
        e.preventDefault();
        router.post(
            '/admin/opciones',
            { tipo, nombre, precio: tipo === 'adicional' ? Number(precio || 0) : 0 },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNombre('');
                    setPrecio('');
                    setError(undefined);
                    toast.success(tipo === 'sabor' ? 'Sabor agregado' : 'Adicional agregado');
                },
                onError: (errs) => setError(errs.nombre ?? errs.precio),
            },
        );
    };

    return (
        <form onSubmit={crear} className="mt-5 flex items-end gap-2 border-t border-tinta/6 pt-5">
            <Campo
                className="flex-1"
                etiqueta={tipo === 'sabor' ? 'Nuevo sabor' : 'Nuevo adicional'}
                placeholder={tipo === 'sabor' ? 'Ej. Pistacho' : 'Ej. Oreo triturada'}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                error={error}
            />
            {tipo === 'adicional' && (
                <Campo
                    className="w-[130px]"
                    etiqueta="Precio"
                    inputMode="numeric"
                    sufijo="COP"
                    value={precio.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    onChange={(e) => setPrecio(soloDigitos(e.target.value))}
                />
            )}
            <PillButton type="submit" variante="tinta" className="mb-[5px] h-10" disabled={!nombre.trim()}>
                Agregar
            </PillButton>
        </form>
    );
}
