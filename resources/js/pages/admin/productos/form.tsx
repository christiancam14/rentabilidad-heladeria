import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { TagSabor } from '@/components/brand/chip';
import { Campo, CampoArea, CampoSelector } from '@/components/brand/campo';
import { FilaToggle, PageHeader, Panel } from '@/components/brand/panel';
import { PillButton } from '@/components/brand/pill-button';
import { FONDOS_FOTO } from '@/components/brand/producto-foto';
import { Toggle } from '@/components/brand/toggle';
import { FilaProducto } from '@/components/menu/piezas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';

interface Opcion {
    id: number;
    tipo: 'sabor' | 'adicional';
    nombre: string;
    precio: number;
    disponible: boolean;
}

interface Tamano {
    nombre: string;
    ajuste_precio: number;
    activo: boolean;
}

interface Grupo {
    nombre: string;
    tipo: 'sabor' | 'adicional';
    obligatorio: boolean;
    max_selecciones: number;
    opciones: { id: number; activo: boolean }[];
}

interface ProductoEdit {
    id: number;
    nombre: string;
    descripcion: string | null;
    categoria_id: number | null;
    precio: number;
    precio_anterior: number | null;
    imagen_url: string | null;
    color: string;
    etiqueta: string | null;
    visible_menu: boolean;
    agotado: boolean;
    sedes_ocultas: number[];
    tamanos: Tamano[];
    grupos: Grupo[];
    rentabilidad: { costo_total: number; ganancia: number; porcentaje: number; insumos: number };
}

interface Props {
    producto: ProductoEdit | null;
    categorias: { id: number; nombre: string; emoji: string | null }[];
    opciones: Opcion[];
    sedes: { id: number; nombre: string }[];
    etiquetas: { value: string; label: string }[];
}

interface FormData {
    nombre: string;
    descripcion: string;
    categoria_id: string;
    precio: string;
    precio_anterior: string;
    color: string;
    etiqueta: string;
    visible_menu: boolean;
    agotado: boolean;
    imagen: File | null;
    quitar_imagen: boolean;
    sedes_ocultas: number[];
    tamanos: Tamano[];
    grupos: Grupo[];
    _method?: string;
}

const soloDigitos = (v: string) => v.replace(/[^\d]/g, '');
const conMiles = (v: string | number) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** B · Editar producto */
export default function ProductoForm({ producto, categorias, opciones, sedes, etiquetas }: Props) {
    const esNuevo = !producto;
    const categoria = categorias.find((c) => c.id === producto?.categoria_id);
    const [preview, setPreview] = useState<string | null>(producto?.imagen_url ?? null);
    const [grupoEditando, setGrupoEditando] = useState<number | null>(null);
    const archivoRef = useRef<HTMLInputElement>(null);

    const inicial: FormData = {
        nombre: producto?.nombre ?? '',
        descripcion: producto?.descripcion ?? '',
        categoria_id: producto?.categoria_id ? String(producto.categoria_id) : String(categorias[0]?.id ?? ''),
        precio: producto ? String(producto.precio) : '',
        precio_anterior: producto?.precio_anterior ? String(producto.precio_anterior) : '',
        color: producto?.color ?? 'turquesa',
        etiqueta: producto?.etiqueta ?? '',
        visible_menu: producto?.visible_menu ?? true,
        agotado: producto?.agotado ?? false,
        imagen: null,
        quitar_imagen: false,
        sedes_ocultas: producto?.sedes_ocultas ?? [],
        tamanos: producto?.tamanos ?? [],
        grupos: producto?.grupos ?? [],
    };

    const form = useForm<FormData>(inicial);
    const { data, setData, errors, processing } = form;

    useEffect(() => {
        if (!data.imagen) return;
        const url = URL.createObjectURL(data.imagen);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.imagen]);

    const porId = useMemo(() => new Map(opciones.map((o) => [o.id, o])), [opciones]);

    const elegirFoto = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) form.setData((d) => ({ ...d, imagen: f, quitar_imagen: false }));
    };

    const guardar = (e?: FormEvent) => {
        e?.preventDefault();
        form.transform((d) => ({
            ...d,
            categoria_id: d.categoria_id ? Number(d.categoria_id) : null,
            precio: Number(soloDigitos(d.precio) || 0),
            precio_anterior: d.precio_anterior ? Number(soloDigitos(d.precio_anterior)) : null,
            etiqueta: d.etiqueta || null,
            ...(esNuevo ? {} : { _method: 'put' }),
        }));
        form.post(esNuevo ? '/admin/productos' : `/admin/productos/${producto.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success(esNuevo ? 'Producto creado' : 'Cambios guardados'),
            onError: () => toast.error('Revisa los campos marcados'),
        });
    };

    const tamano = (i: number, cambio: Partial<Tamano>) =>
        setData('tamanos', data.tamanos.map((t, j) => (j === i ? { ...t, ...cambio } : t)));
    const grupo = (i: number, cambio: Partial<Grupo>) => setData('grupos', data.grupos.map((g, j) => (j === i ? { ...g, ...cambio } : g)));

    const agregarGrupo = (tipo: 'sabor' | 'adicional') => {
        const delTipo = opciones.filter((o) => o.tipo === tipo);
        setData('grupos', [
            ...data.grupos,
            {
                nombre: tipo === 'sabor' ? 'Elige 2 sabores' : 'Súmale algo rico',
                tipo,
                obligatorio: tipo === 'sabor',
                max_selecciones: tipo === 'sabor' ? 2 : 3,
                opciones: (tipo === 'sabor' ? delTipo : delTipo.slice(0, 3)).map((o) => ({ id: o.id, activo: true })),
            },
        ]);
        setGrupoEditando(data.grupos.length);
    };

    // Vista previa en vivo con la misma fila del menú público
    const precioNum = Number(soloDigitos(data.precio) || 0);
    const vistaPrevia = {
        id: producto?.id ?? 0,
        categoria_id: Number(data.categoria_id) || null,
        nombre: data.nombre || 'Nombre del producto',
        descripcion: data.descripcion || 'Descripción corta del producto',
        precio: precioNum,
        precio_anterior: data.precio_anterior ? Number(soloDigitos(data.precio_anterior)) : null,
        imagen_url: data.quitar_imagen ? null : preview,
        color: data.color,
        etiqueta: (data.etiqueta || null) as never,
        agotado: data.agotado,
        tamanos: [],
        grupos: [],
    };

    const rent = producto?.rentabilidad;
    const margenPreview = rent && precioNum > 0 ? ((precioNum - rent.costo_total) / precioNum) * 100 : null;

    const breadcrumbs: BreadcrumbItem[] = [];
    const errorDe = (clave: string) => (errors as Record<string, string>)[clave];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={esNuevo ? 'Nuevo producto' : producto.nombre} />

            <form onSubmit={guardar} className="flex flex-col gap-6">
                <PageHeader
                    miga={
                        <>
                            <Link href="/admin/productos" className="hover:text-tinta">
                                Productos
                            </Link>
                            {categoria && ` / ${categoria.nombre}`}
                        </>
                    }
                    titulo={esNuevo ? 'Nuevo producto' : data.nombre || producto.nombre}
                    acciones={
                        <>
                            <PillButton
                                type="button"
                                variante="contorno"
                                tamano="lg"
                                flecha
                                onClick={() => (form.isDirty ? form.setData(inicial) : router.visit('/admin/productos'))}
                            >
                                {form.isDirty ? 'Descartar' : 'Volver'}
                            </PillButton>
                            <PillButton type="submit" tamano="lg" flecha disabled={processing}>
                                {processing ? 'Guardando…' : esNuevo ? 'Crear producto' : 'Guardar cambios'}
                            </PillButton>
                        </>
                    }
                />

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="flex min-w-0 flex-col gap-5">
                        <Panel titulo="Información básica">
                            <div className="flex flex-col gap-5 md:flex-row">
                                <div className="flex shrink-0 flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => archivoRef.current?.click()}
                                        className={cn(
                                            'relative grid size-[180px] place-items-center overflow-hidden rounded-[20px] border-2 border-dashed border-turquesa text-turquesa',
                                            preview && !data.quitar_imagen ? FONDOS_FOTO[data.color] : 'bg-turquesa-suave',
                                        )}
                                    >
                                        {preview && !data.quitar_imagen ? (
                                            <img src={preview} alt="" className="absolute inset-0 size-full object-contain p-3" />
                                        ) : (
                                            <span className="flex flex-col items-center gap-1">
                                                <Plus className="size-8" strokeWidth={2} />
                                                <span className="text-meta max-w-[110px] text-center text-[10px] text-tinta">Subir foto PNG sin fondo</span>
                                            </span>
                                        )}
                                    </button>
                                    <input ref={archivoRef} type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={elegirFoto} />
                                    {preview && !data.quitar_imagen && (
                                        <button
                                            type="button"
                                            className="text-meta text-[10px] text-tinta/50 hover:text-rosa"
                                            onClick={() => {
                                                form.setData((d) => ({ ...d, imagen: null, quitar_imagen: true }));
                                                setPreview(null);
                                            }}
                                        >
                                            Quitar foto
                                        </button>
                                    )}
                                    {errorDe('imagen') && <p className="max-w-[180px] text-xs text-rosa">{errorDe('imagen')}</p>}
                                    <div className="flex items-center justify-center gap-2 pt-1">
                                        {Object.keys(FONDOS_FOTO)
                                            .filter((c) => c !== 'blanco')
                                            .map((c) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    aria-label={`Fondo ${c}`}
                                                    onClick={() => setData('color', c)}
                                                    className={cn(
                                                        'size-6 rounded-full border-2',
                                                        FONDOS_FOTO[c],
                                                        data.color === c ? 'border-tinta' : 'border-transparent',
                                                    )}
                                                />
                                            ))}
                                    </div>
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-4">
                                    <Campo
                                        etiqueta="Nombre"
                                        value={data.nombre}
                                        maxLength={40}
                                        contador
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        error={errors.nombre}
                                        required
                                    />
                                    <CampoArea
                                        etiqueta="Descripción corta"
                                        value={data.descripcion}
                                        maxLength={90}
                                        onChange={(e) => setData('descripcion', e.target.value)}
                                        error={errors.descripcion}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <CampoSelector
                                    etiqueta="Categoría"
                                    value={data.categoria_id}
                                    onChange={(e) => setData('categoria_id', e.target.value)}
                                    error={errors.categoria_id}
                                >
                                    <option value="">Sin categoría</option>
                                    {categorias.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.emoji} {c.nombre}
                                        </option>
                                    ))}
                                </CampoSelector>
                                <Campo
                                    etiqueta="Precio base"
                                    inputMode="numeric"
                                    sufijo="COP"
                                    value={conMiles(soloDigitos(data.precio))}
                                    onChange={(e) => setData('precio', soloDigitos(e.target.value))}
                                    error={errors.precio}
                                    required
                                />
                                <CampoSelector
                                    etiqueta="Etiqueta destacada"
                                    value={data.etiqueta}
                                    onChange={(e) => setData('etiqueta', e.target.value)}
                                    error={errors.etiqueta}
                                >
                                    <option value="">Ninguna</option>
                                    {etiquetas.map((e) => (
                                        <option key={e.value} value={e.value}>
                                            {e.label}
                                        </option>
                                    ))}
                                </CampoSelector>
                            </div>
                            {data.etiqueta === 'combo' && (
                                <Campo
                                    className="mt-4 md:max-w-[33%]"
                                    etiqueta="Precio antes (tachado)"
                                    inputMode="numeric"
                                    sufijo="COP"
                                    value={conMiles(soloDigitos(data.precio_anterior))}
                                    onChange={(e) => setData('precio_anterior', soloDigitos(e.target.value))}
                                    error={errors.precio_anterior}
                                />
                            )}
                        </Panel>

                        <Panel titulo="Tamaños" descripcion="El cliente elige uno. El precio se suma o resta al precio base.">
                            <div className="flex flex-col gap-4">
                                {data.tamanos.length === 0 && (
                                    <p className="rounded-2xl bg-hueso px-4 py-3 text-sm text-tinta/60">Este producto tiene un solo tamaño.</p>
                                )}
                                {data.tamanos.map((t, i) => (
                                    <div key={i} className="grid grid-cols-[1fr_auto] items-end gap-3 sm:grid-cols-[minmax(0,1fr)_200px_auto_auto]">
                                        <Campo
                                            className="col-span-2 sm:col-span-1"
                                            etiqueta="Nombre del tamaño"
                                            value={t.nombre}
                                            placeholder="Mediana · 2 bolas"
                                            onChange={(e) => tamano(i, { nombre: e.target.value })}
                                            error={errorDe(`tamanos.${i}.nombre`)}
                                        />
                                        <Campo
                                            etiqueta="Ajuste de precio"
                                            inputMode="numeric"
                                            sufijo="COP"
                                            value={t.ajuste_precio === 0 ? '0' : `${t.ajuste_precio > 0 ? '+ ' : '- '}${conMiles(Math.abs(t.ajuste_precio))}`}
                                            onChange={(e) => {
                                                const negativo = e.target.value.trim().startsWith('-');
                                                const n = Number(soloDigitos(e.target.value) || 0);
                                                tamano(i, { ajuste_precio: negativo ? -n : n });
                                            }}
                                            error={errorDe(`tamanos.${i}.ajuste_precio`)}
                                        />
                                        <div className="flex h-[50px] items-center">
                                            <Toggle checked={t.activo} label="Tamaño activo" onChange={(v) => tamano(i, { activo: v })} />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData('tamanos', data.tamanos.filter((_, j) => j !== i))}
                                            className="grid h-[50px] w-9 place-items-center text-tinta/35 hover:text-rosa"
                                            aria-label="Quitar tamaño"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setData('tamanos', [...data.tamanos, { nombre: '', ajuste_precio: 0, activo: true }])}
                                    className="font-display self-start text-sm font-bold text-rosa"
                                >
                                    + Agregar tamaño
                                </button>
                            </div>
                        </Panel>

                        <Panel titulo="Opciones del producto" descripcion="Grupos que el cliente personaliza en la pantalla de pedido.">
                            <div className="flex flex-col gap-4">
                                {data.grupos.map((g, i) => {
                                    const activas = g.opciones.filter((o) => o.activo);
                                    return (
                                        <div key={i} className="rounded-[18px] bg-hueso p-[18px]">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-display text-[15px] font-bold tracking-[-0.02em]">
                                                    {g.nombre || 'Grupo sin nombre'} · {g.obligatorio ? 'obligatorio' : 'opcional'} ·{' '}
                                                    {g.tipo === 'sabor' ? `elegir ${g.max_selecciones}` : `hasta ${g.max_selecciones}`}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setGrupoEditando(i)}
                                                    className="font-display shrink-0 text-[13px] font-bold text-rosa"
                                                >
                                                    Editar grupo
                                                </button>
                                            </div>
                                            {g.tipo === 'sabor' ? (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {activas.slice(0, 8).map((o) => (
                                                        <TagSabor key={o.id} className={cn(!porId.get(o.id)?.disponible && 'line-through opacity-50')}>
                                                            {porId.get(o.id)?.nombre}
                                                        </TagSabor>
                                                    ))}
                                                    {activas.length > 8 && <TagSabor>+{activas.length - 8} más</TagSabor>}
                                                    {activas.length === 0 && <p className="text-sm text-tinta/55">Sin sabores elegidos.</p>}
                                                </div>
                                            ) : (
                                                <div className="mt-3 flex flex-col gap-2.5">
                                                    {g.opciones.map((o, j) => {
                                                        const op = porId.get(o.id);
                                                        if (!op) return null;
                                                        return (
                                                            <div key={o.id} className="flex items-center justify-between gap-3">
                                                                <span className={cn('text-[15px] font-medium', !op.disponible && 'line-through opacity-50')}>
                                                                    {op.nombre}
                                                                </span>
                                                                <span className="flex items-center gap-4">
                                                                    <span className="font-display text-[13px] font-bold">+ {formatPrice(op.precio)}</span>
                                                                    <Toggle
                                                                        checked={o.activo}
                                                                        label={`Mostrar ${op.nombre}`}
                                                                        onChange={(v) =>
                                                                            grupo(i, { opciones: g.opciones.map((x, k) => (k === j ? { ...x, activo: v } : x)) })
                                                                        }
                                                                    />
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                    {g.opciones.length === 0 && <p className="text-sm text-tinta/55">Sin adicionales elegidos.</p>}
                                                </div>
                                            )}
                                            {errorDe(`grupos.${i}.nombre`) && <p className="mt-2 text-xs text-rosa">{errorDe(`grupos.${i}.nombre`)}</p>}
                                        </div>
                                    );
                                })}
                                <div className="flex flex-wrap gap-4">
                                    <button type="button" onClick={() => agregarGrupo('sabor')} className="font-display text-sm font-bold text-rosa">
                                        + Agregar grupo de sabores
                                    </button>
                                    <button type="button" onClick={() => agregarGrupo('adicional')} className="font-display text-sm font-bold text-rosa">
                                        + Agregar grupo de adicionales
                                    </button>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <aside className="flex flex-col gap-4 xl:sticky xl:top-[88px]">
                        <Panel className="p-5">
                            <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Vista previa en el menú</h2>
                            <div className="pointer-events-none mt-3 rounded-[18px] bg-hueso px-3">
                                <FilaProducto producto={vistaPrevia} cantidad={0} onAbrir={() => {}} onMas={() => {}} onMenos={() => {}} />
                            </div>
                            <p className="mt-3 text-xs text-tinta/55">Así se ve para tus clientes. Se actualiza mientras editas.</p>
                        </Panel>

                        <Panel className="p-5">
                            <h2 className="font-display mb-3 text-lg font-bold tracking-[-0.02em]">Disponibilidad</h2>
                            <div className="flex flex-col gap-3.5">
                                <FilaToggle titulo="Visible en el menú">
                                    <Toggle checked={data.visible_menu} onChange={(v) => setData('visible_menu', v)} label="Visible en el menú" />
                                </FilaToggle>
                                {sedes.map((s) => (
                                    <FilaToggle key={s.id} titulo={s.nombre}>
                                        <Toggle
                                            checked={!data.sedes_ocultas.includes(s.id)}
                                            label={`Disponible en ${s.nombre}`}
                                            onChange={(v) =>
                                                setData(
                                                    'sedes_ocultas',
                                                    v ? data.sedes_ocultas.filter((id) => id !== s.id) : [...data.sedes_ocultas, s.id],
                                                )
                                            }
                                        />
                                    </FilaToggle>
                                ))}
                                <FilaToggle titulo="Marcar como agotado">
                                    <Toggle checked={data.agotado} onChange={(v) => setData('agotado', v)} label="Agotado" />
                                </FilaToggle>
                            </div>
                        </Panel>

                        {rent && (
                            <Panel className="p-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Rentabilidad</h2>
                                    <Link href={`/productos/${producto.id}`} className="font-display text-[13px] font-bold text-rosa">
                                        Receta y costos →
                                    </Link>
                                </div>
                                {rent.insumos === 0 ? (
                                    <p className="text-sm text-tinta/60">Aún no tiene receta. Agrégale insumos para conocer su margen real.</p>
                                ) : (
                                    <dl className="grid grid-cols-3 gap-2 text-center">
                                        <Dato titulo="Costo" valor={formatPrice(rent.costo_total)} />
                                        <Dato titulo="Ganancia" valor={formatPrice(precioNum - rent.costo_total)} />
                                        <Dato
                                            titulo="Margen"
                                            valor={`${Math.round(margenPreview ?? rent.porcentaje)}%`}
                                            resaltado={(margenPreview ?? rent.porcentaje) >= 60 ? 'bg-turquesa-suave' : 'bg-rosa-suave/60'}
                                        />
                                    </dl>
                                )}
                            </Panel>
                        )}

                        <div className="rounded-[24px] bg-amarillo-suave p-5">
                            <p className="font-display text-[15px] font-bold">💡 Consejo de venta</p>
                            <p className="mt-1.5 text-[13px] leading-[1.45] font-medium text-tinta/80">
                                Los productos con 2–3 adicionales visibles venden más. Pon primero los de mayor margen.
                            </p>
                        </div>
                    </aside>
                </div>
            </form>

            <Dialog open={grupoEditando !== null} onOpenChange={(o) => !o && setGrupoEditando(null)}>
                <DialogContent className="max-h-[90svh] overflow-y-auto rounded-[24px] bg-white sm:max-w-[560px]">
                    {grupoEditando !== null && data.grupos[grupoEditando] && (
                        <EditorGrupo
                            grupo={data.grupos[grupoEditando]}
                            opciones={opciones.filter((o) => o.tipo === data.grupos[grupoEditando].tipo)}
                            onCambio={(c) => grupo(grupoEditando, c)}
                            onEliminar={() => {
                                setData('grupos', data.grupos.filter((_, j) => j !== grupoEditando));
                                setGrupoEditando(null);
                            }}
                            onListo={() => setGrupoEditando(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function Dato({ titulo, valor, resaltado }: { titulo: string; valor: string; resaltado?: string }) {
    return (
        <div className={cn('rounded-2xl bg-hueso px-2 py-3', resaltado)}>
            <dt className="text-meta text-[10px] text-tinta/55">{titulo}</dt>
            <dd className="font-display mt-1 text-[17px] font-bold tracking-[-0.02em]">{valor}</dd>
        </div>
    );
}

function EditorGrupo({
    grupo,
    opciones,
    onCambio,
    onEliminar,
    onListo,
}: {
    grupo: Grupo;
    opciones: Opcion[];
    onCambio: (c: Partial<Grupo>) => void;
    onEliminar: () => void;
    onListo: () => void;
}) {
    const ids = grupo.opciones.map((o) => o.id);
    const alternar = (id: number) =>
        onCambio({ opciones: ids.includes(id) ? grupo.opciones.filter((o) => o.id !== id) : [...grupo.opciones, { id, activo: true }] });

    return (
        <>
            <DialogHeader>
                <DialogTitle className="font-display text-2xl font-extrabold tracking-[-0.03em]">
                    Grupo de {grupo.tipo === 'sabor' ? 'sabores' : 'adicionales'}
                </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
                <Campo etiqueta="Nombre que ve el cliente" value={grupo.nombre} onChange={(e) => onCambio({ nombre: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                    <Campo
                        etiqueta={grupo.tipo === 'sabor' ? 'Cuántos elige' : 'Máximo'}
                        type="number"
                        min={1}
                        max={20}
                        value={String(grupo.max_selecciones)}
                        onChange={(e) => onCambio({ max_selecciones: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
                    />
                    <div className="flex flex-col gap-2">
                        <span className="font-display text-[13px] font-bold">Obligatorio</span>
                        <div className="flex h-[50px] items-center">
                            <Toggle checked={grupo.obligatorio} onChange={(v) => onCambio({ obligatorio: v })} label="Obligatorio" />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <span className="font-display text-[13px] font-bold">Opciones ({ids.length})</span>
                        <span className="flex gap-3">
                            <button
                                type="button"
                                className="text-meta text-[10px] text-rosa"
                                onClick={() => onCambio({ opciones: opciones.map((o) => ({ id: o.id, activo: true })) })}
                            >
                                Todas
                            </button>
                            <button type="button" className="text-meta text-[10px] text-tinta/50" onClick={() => onCambio({ opciones: [] })}>
                                Ninguna
                            </button>
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 rounded-[18px] bg-hueso p-3">
                        {opciones.map((o) => (
                            <TagSabor key={o.id} activo={ids.includes(o.id)} onClick={() => alternar(o.id)}>
                                {o.nombre}
                                {o.tipo === 'adicional' && ` · ${formatPrice(o.precio)}`}
                            </TagSabor>
                        ))}
                        {opciones.length === 0 && (
                            <p className="text-sm text-tinta/60">
                                La biblioteca está vacía.{' '}
                                <Link href="/admin/opciones" className="text-rosa">
                                    Crear {grupo.tipo === 'sabor' ? 'sabores' : 'adicionales'}
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <button type="button" onClick={onEliminar} className="font-display text-sm font-bold text-tinta/50 hover:text-rosa">
                        Eliminar grupo
                    </button>
                    <PillButton type="button" variante="tinta" onClick={onListo}>
                        Listo
                    </PillButton>
                </div>
            </div>
        </>
    );
}
