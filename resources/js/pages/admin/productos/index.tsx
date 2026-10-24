import { Head, Link, router } from '@inertiajs/react';
import { GripVertical, MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Chip } from '@/components/brand/chip';
import { EstadoBadge } from '@/components/brand/estado-badge';
import { PageHeader } from '@/components/brand/panel';
import { PillLink } from '@/components/brand/pill-button';
import { ProductoFoto } from '@/components/brand/producto-foto';
import { Toggle } from '@/components/brand/toggle';
import ConfirmDialog from '@/components/confirm-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils';

interface Producto {
    id: number;
    nombre: string;
    categoria_id: number | null;
    categoria: string | null;
    precio: number;
    imagen_url: string | null;
    color: string;
    etiqueta: string | null;
    agotado: boolean;
    visible_menu: boolean;
    tamanos: number;
    grupos_sabor: number;
    grupos_adicional: number;
    tiene_receta: boolean;
    porcentaje_rentabilidad: number;
    actualizado: string | null;
}

interface Props {
    productos: Producto[];
    categorias: { id: number; nombre: string; emoji: string | null }[];
}

const POR_PAGINA = 12;

function hace(iso: string | null): string {
    if (!iso) return '';
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 60) return `hace ${Math.max(1, min)} min`;
    if (min < 1440) return `hace ${Math.floor(min / 60)} h`;
    return `hace ${Math.floor(min / 1440)} d`;
}

function resumen(p: Producto): string {
    const partes = [`${p.tamanos || 1} ${p.tamanos === 1 || !p.tamanos ? 'tamaño' : 'tamaños'}`];
    if (p.grupos_sabor) partes.push('sabores');
    if (p.grupos_adicional) partes.push('adicionales');
    if (!p.tiene_receta) partes.push('sin receta');
    return partes.join(' · ');
}

/** A · Productos del menú */
export default function ProductosMenu({ productos, categorias }: Props) {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [filtro, setFiltro] = useState<number | 'todos' | 'sin'>('todos');
    const [buscar, setBuscar] = useState(params.get('buscar') ?? '');
    const [pagina, setPagina] = useState(1);
    const [eliminar, setEliminar] = useState<Producto | null>(null);
    const [arrastrando, setArrastrando] = useState<number | null>(null);
    const [orden, setOrden] = useState<number[] | null>(null);

    const filtrados = useMemo(() => {
        const t = buscar.trim().toLowerCase();
        let lista = productos.filter((p) =>
            filtro === 'todos' ? true : filtro === 'sin' ? p.categoria_id === null : p.categoria_id === filtro,
        );
        if (t) lista = lista.filter((p) => p.nombre.toLowerCase().includes(t));
        if (orden) lista = [...lista].sort((a, b) => orden.indexOf(a.id) - orden.indexOf(b.id));
        return lista;
    }, [productos, filtro, buscar, orden]);

    const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
    const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
    const ultimaEdicion = productos.reduce<string | null>((m, p) => (!m || (p.actualizado && p.actualizado > m) ? p.actualizado : m), null);
    const sinCategoria = productos.filter((p) => p.categoria_id === null).length;
    const puedeOrdenar = typeof filtro === 'number' && !buscar;

    const cambiar = (p: Producto, data: Partial<Pick<Producto, 'visible_menu' | 'agotado'>>) =>
        router.patch(`/admin/productos/${p.id}/visibilidad`, data, { preserveScroll: true, preserveState: true });

    const soltar = (destino: number) => {
        if (arrastrando === null || arrastrando === destino) return;
        const ids = filtrados.map((p) => p.id);
        const de = ids.indexOf(arrastrando);
        const a = ids.indexOf(destino);
        ids.splice(a, 0, ids.splice(de, 1)[0]);
        setOrden(ids);
        router.post('/admin/productos/ordenar', { ids }, { preserveScroll: true, preserveState: true, onFinish: () => setOrden(null) });
    };

    const elegir = (f: typeof filtro) => {
        setFiltro(f);
        setPagina(1);
    };

    return (
        <AppLayout>
            <Head title="Productos" />

            <PageHeader
                titulo="Productos"
                descripcion={`${productos.length} productos · ${categorias.length} categorías${ultimaEdicion ? ` · última edición ${hace(ultimaEdicion)}` : ''}`}
                acciones={
                    <>
                        <PillLink href="/productos" variante="contorno" tamano="lg" flecha>
                            Costeo
                        </PillLink>
                        <PillLink href="/admin/productos/create" tamano="lg" flecha>
                            Nuevo producto
                        </PillLink>
                    </>
                }
            />

            <div className="flex flex-wrap gap-2">
                <Chip activo={filtro === 'todos'} emoji="✨" contador={productos.length} onClick={() => elegir('todos')}>
                    Todos
                </Chip>
                {categorias.map((c) => (
                    <Chip
                        key={c.id}
                        activo={filtro === c.id}
                        emoji={c.emoji}
                        contador={productos.filter((p) => p.categoria_id === c.id).length}
                        onClick={() => elegir(c.id)}
                    >
                        {c.nombre}
                    </Chip>
                ))}
                {sinCategoria > 0 && (
                    <Chip activo={filtro === 'sin'} emoji="🫥" contador={sinCategoria} onClick={() => elegir('sin')}>
                        Sin categoría
                    </Chip>
                )}
            </div>

            {buscar && (
                <p className="-mt-2 text-sm text-tinta/60">
                    Buscando “{buscar}” ·{' '}
                    <button type="button" className="text-rosa" onClick={() => setBuscar('')}>
                        limpiar
                    </button>
                </p>
            )}

            <div className="overflow-hidden rounded-[24px] border border-tinta/8 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px] text-left">
                        <thead className="bg-[#f6f2ec]">
                            <tr className="text-meta text-[11px] text-tinta/70">
                                <th className="w-10 py-3.5 pl-5" />
                                <th className="py-3.5 pl-2">Producto</th>
                                <th className="py-3.5">Categoría</th>
                                <th className="py-3.5">Precio</th>
                                <th className="py-3.5">Estado</th>
                                <th className="py-3.5">Visible</th>
                                <th className="py-3.5 pr-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibles.map((p) => (
                                <tr
                                    key={p.id}
                                    draggable={puedeOrdenar}
                                    onDragStart={() => setArrastrando(p.id)}
                                    onDragOver={(e) => puedeOrdenar && e.preventDefault()}
                                    onDrop={() => soltar(p.id)}
                                    onDragEnd={() => setArrastrando(null)}
                                    className={cn(
                                        'h-[72px] border-t border-tinta/6 transition-colors hover:bg-hueso/60',
                                        !p.visible_menu && 'text-tinta/55',
                                        arrastrando === p.id && 'opacity-40',
                                    )}
                                >
                                    <td className="pl-5">
                                        <GripVertical
                                            className={cn('size-4 text-tinta/30', puedeOrdenar ? 'cursor-grab' : 'opacity-40')}
                                            aria-label={puedeOrdenar ? 'Arrastra para ordenar' : 'Filtra por categoría para ordenar'}
                                        />
                                    </td>
                                    <td className="py-3 pl-2">
                                        <Link href={`/admin/productos/${p.id}/edit`} className="flex items-center gap-4">
                                            <ProductoFoto
                                                src={p.imagen_url}
                                                color={p.color}
                                                className={cn('size-12 shrink-0 rounded-[12px]', !p.visible_menu && 'opacity-50')}
                                            />
                                            <span className="min-w-0">
                                                <span className="font-display block truncate text-[15px] font-bold tracking-[-0.02em]">{p.nombre}</span>
                                                <span className="block truncate text-xs font-medium text-tinta/55">{resumen(p)}</span>
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="text-sm font-medium">{p.categoria ?? <span className="text-tinta/40">—</span>}</td>
                                    <td className="font-display text-[15px] font-bold tracking-[-0.02em]">{formatPrice(p.precio)}</td>
                                    <td>
                                        <EstadoBadge
                                            estado={!p.visible_menu ? 'oculto' : p.agotado ? 'agotado' : p.etiqueta === 'nuevo' ? 'nuevo' : 'disponible'}
                                        />
                                    </td>
                                    <td>
                                        <Toggle
                                            checked={p.visible_menu}
                                            label={`Mostrar ${p.nombre} en el menú`}
                                            onChange={(v) => cambiar(p, { visible_menu: v })}
                                        />
                                    </td>
                                    <td className="pr-5 text-right">
                                        <div className="font-display inline-flex items-center gap-1 text-[13px] font-bold text-tinta/60">
                                            <Link href={`/admin/productos/${p.id}/edit`} className="rounded-full px-2 py-1 hover:bg-tinta/5 hover:text-tinta">
                                                Editar
                                            </Link>
                                            <span>·</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger className="rounded-full p-1 hover:bg-tinta/5 hover:text-tinta" aria-label="Más acciones">
                                                    <MoreHorizontal className="size-4" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuItem onClick={() => cambiar(p, { agotado: !p.agotado })}>
                                                        {p.agotado ? 'Marcar disponible' : 'Marcar agotado'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/productos/${p.id}`}>Receta y costos</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-rosa" onClick={() => setEliminar(p)}>
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {visibles.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-14 text-center text-sm text-tinta/55">
                                        No hay productos en esta vista.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between border-t border-tinta/6 px-5 py-3.5 text-[13px] font-medium text-tinta/70">
                    <span>
                        Mostrando {visibles.length} de {filtrados.length}
                        {puedeOrdenar ? ' · arrastra ⋮⋮ para ordenar el menú' : ''}
                    </span>
                    {paginas > 1 && (
                        <div className="font-display flex items-center gap-1 font-bold">
                            <button type="button" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)} className="px-1.5 disabled:opacity-30">
                                ‹
                            </button>
                            {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setPagina(n)}
                                    className={cn('grid size-7 place-items-center rounded-full', n === pagina ? 'bg-tinta text-hueso' : 'hover:bg-tinta/5')}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={pagina === paginas}
                                onClick={() => setPagina(pagina + 1)}
                                className="px-1.5 disabled:opacity-30"
                            >
                                ›
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={!!eliminar}
                onOpenChange={(o) => !o && setEliminar(null)}
                title="¿Eliminar producto?"
                description={`Se eliminará "${eliminar?.nombre}" del menú y también su receta de costeo. Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                variant="destructive"
                onConfirm={() => {
                    if (eliminar) router.delete(`/admin/productos/${eliminar.id}`, { preserveScroll: true });
                    setEliminar(null);
                }}
            />
        </AppLayout>
    );
}
