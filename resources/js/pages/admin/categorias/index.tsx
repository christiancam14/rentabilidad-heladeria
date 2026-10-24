import { Head, Link, router, useForm } from '@inertiajs/react';
import { GripVertical } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import { Campo } from '@/components/brand/campo';
import { PageHeader, Panel } from '@/components/brand/panel';
import { PillButton } from '@/components/brand/pill-button';
import { Toggle } from '@/components/brand/toggle';
import ConfirmDialog from '@/components/confirm-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Categoria {
    id: number;
    nombre: string;
    slug: string;
    emoji: string | null;
    orden: number;
    visible: boolean;
    productos_count: number;
    visibles_count: number;
}

const EMOJIS = ['🍨', '🥤', '🧇', '🧸', '🫓', '🍓', '🍰', '🧋', '🍦', '🍧', '🍫', '🥞', '🍌', '☕', '🎉', '⭐'];

export default function Categorias({ categorias }: { categorias: Categoria[] }) {
    const [editando, setEditando] = useState<Categoria | 'nueva' | null>(null);
    const [eliminar, setEliminar] = useState<Categoria | null>(null);
    const [arrastrando, setArrastrando] = useState<number | null>(null);
    const form = useForm({ nombre: '', emoji: '🍨' });

    const abrir = (c: Categoria | 'nueva') => {
        form.clearErrors();
        form.setData(c === 'nueva' ? { nombre: '', emoji: '🍨' } : { nombre: c.nombre, emoji: c.emoji ?? '' });
        setEditando(c);
    };

    const guardar = (e: FormEvent) => {
        e.preventDefault();
        const opciones = {
            preserveScroll: true,
            onSuccess: () => {
                setEditando(null);
                toast.success('Categoría guardada');
            },
        };
        if (editando === 'nueva') form.post('/admin/categorias', opciones);
        else if (editando) form.put(`/admin/categorias/${editando.id}`, opciones);
    };

    const soltar = (destino: number) => {
        if (arrastrando === null || arrastrando === destino) return;
        const ids = categorias.map((c) => c.id);
        ids.splice(ids.indexOf(destino), 0, ids.splice(ids.indexOf(arrastrando), 1)[0]);
        router.post('/admin/categorias/ordenar', { ids }, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Categorías" />
            <PageHeader
                titulo="Categorías"
                descripcion="Agrupan los productos en el menú. Arrastra para cambiar el orden en que aparecen."
                acciones={
                    <PillButton tamano="lg" flecha onClick={() => abrir('nueva')}>
                        Nueva categoría
                    </PillButton>
                }
            />

            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {categorias.map((c) => (
                    <div
                        key={c.id}
                        draggable
                        onDragStart={() => setArrastrando(c.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => soltar(c.id)}
                        onDragEnd={() => setArrastrando(null)}
                        className={cn(
                            'flex items-center gap-4 rounded-[22px] border border-tinta/8 bg-white p-4 transition-opacity',
                            !c.visible && 'opacity-60',
                            arrastrando === c.id && 'opacity-30',
                        )}
                    >
                        <GripVertical className="size-4 shrink-0 cursor-grab text-tinta/30" />
                        <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-hueso text-2xl">{c.emoji || '🍦'}</span>
                        <div className="min-w-0 flex-1">
                            <p className="font-display truncate text-[17px] font-bold tracking-[-0.02em]">{c.nombre}</p>
                            <Link href="/admin/productos" className="text-xs font-medium text-tinta/55 hover:text-rosa">
                                {c.visibles_count} de {c.productos_count} productos visibles
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => abrir(c)} className="font-display text-[13px] font-bold text-tinta/60 hover:text-tinta">
                                Editar
                            </button>
                            <Toggle
                                checked={c.visible}
                                label={`Mostrar ${c.nombre}`}
                                onChange={(v) => router.put(`/admin/categorias/${c.id}`, { visible: v }, { preserveScroll: true })}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {categorias.length === 0 && (
                <Panel className="text-center text-sm text-tinta/60">Aún no hay categorías. Crea la primera para organizar tu menú.</Panel>
            )}

            <Dialog open={editando !== null} onOpenChange={(o) => !o && setEditando(null)}>
                <DialogContent className="rounded-[24px] bg-white sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-extrabold tracking-[-0.03em]">
                            {editando === 'nueva' ? 'Nueva categoría' : 'Editar categoría'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={guardar} className="flex flex-col gap-4">
                        <Campo
                            etiqueta="Nombre"
                            value={form.data.nombre}
                            maxLength={40}
                            onChange={(e) => form.setData('nombre', e.target.value)}
                            error={form.errors.nombre}
                            autoFocus
                        />
                        <div className="flex flex-col gap-2">
                            <span className="font-display text-[13px] font-bold">Ícono</span>
                            <div className="flex flex-wrap gap-1.5">
                                {EMOJIS.map((e) => (
                                    <button
                                        key={e}
                                        type="button"
                                        onClick={() => form.setData('emoji', e)}
                                        className={cn(
                                            'grid size-10 place-items-center rounded-xl text-xl',
                                            form.data.emoji === e ? 'bg-tinta' : 'bg-hueso hover:bg-tinta/10',
                                        )}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            {editando && editando !== 'nueva' ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEliminar(editando);
                                        setEditando(null);
                                    }}
                                    className="font-display text-sm font-bold text-tinta/50 hover:text-rosa"
                                >
                                    Eliminar
                                </button>
                            ) : (
                                <span />
                            )}
                            <PillButton type="submit" variante="tinta" disabled={form.processing}>
                                Guardar
                            </PillButton>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!eliminar}
                onOpenChange={(o) => !o && setEliminar(null)}
                title="¿Eliminar categoría?"
                description={`Los ${eliminar?.productos_count ?? 0} productos de "${eliminar?.nombre}" quedarán sin categoría y no se mostrarán en el menú.`}
                confirmText="Eliminar"
                variant="destructive"
                onConfirm={() => eliminar && router.delete(`/admin/categorias/${eliminar.id}`, { preserveScroll: true })}
            />
        </AppLayout>
    );
}
