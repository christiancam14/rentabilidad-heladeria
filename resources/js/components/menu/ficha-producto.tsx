import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { TagSabor } from '@/components/brand/chip';
import { formatPrice } from '@/lib/format-price';
import { cotizar, tamanoPorDefecto } from '@/lib/menu';
import { cn } from '@/lib/utils';
import { type MenuProducto } from '@/types/menu';

import { Cta, EtiquetaBadge, MiniSugerencia, Opcion, precioExtra, Stepper } from './piezas';

const GLOW: Record<string, string> = {
    turquesa: 'radial-gradient(60% 70% at 30% 40%, #00c6da 0%, rgba(0,198,218,0.35) 45%, transparent 75%), radial-gradient(55% 60% at 85% 85%, #ff537d 0%, rgba(255,83,125,0.25) 50%, transparent 80%)',
    rosa: 'radial-gradient(60% 70% at 30% 40%, #ff537d 0%, rgba(255,83,125,0.35) 45%, transparent 75%), radial-gradient(55% 60% at 85% 85%, #ffca4f 0%, rgba(255,202,79,0.3) 50%, transparent 80%)',
    amarillo: 'radial-gradient(60% 70% at 30% 40%, #ffca4f 0%, rgba(255,202,79,0.4) 45%, transparent 75%), radial-gradient(55% 60% at 85% 85%, #00c6da 0%, rgba(0,198,218,0.25) 50%, transparent 80%)',
};

interface FichaProductoProps {
    producto: MenuProducto;
    sugerencias: MenuProducto[];
    onCerrar: () => void;
    onAgregar: (tamanoId: number | null, opciones: number[], cantidad: number) => void;
    onAbrirOtro: (p: MenuProducto) => void;
    onAgregarRapido: (p: MenuProducto) => void;
}

/** Hoja de producto: tamaño, sabores, adicionales y CTA fija con el total. */
export function FichaProducto({ producto, sugerencias, onCerrar, onAgregar, onAbrirOtro, onAgregarRapido }: FichaProductoProps) {
    const [tamanoId, setTamanoId] = useState<number | null>(() => tamanoPorDefecto(producto));
    const [opciones, setOpciones] = useState<number[]>([]);
    const [cantidad, setCantidad] = useState(1);

    useEffect(() => {
        const previo = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
        window.addEventListener('keydown', esc);
        return () => {
            document.body.style.overflow = previo;
            window.removeEventListener('keydown', esc);
        };
    }, [onCerrar]);

    const { precio } = useMemo(() => cotizar(producto, tamanoId, opciones), [producto, tamanoId, opciones]);

    const pendiente = producto.grupos.find((g) => g.obligatorio && !g.opciones.some((o) => opciones.includes(o.id)));
    const desde = producto.precio + Math.min(0, ...producto.tamanos.map((t) => t.ajuste));

    const alternar = (grupoId: number, opcionId: number) => {
        const grupo = producto.grupos.find((g) => g.id === grupoId)!;
        const delGrupo = grupo.opciones.map((o) => o.id);
        setOpciones((prev) => {
            if (prev.includes(opcionId)) return prev.filter((id) => id !== opcionId);
            const elegidas = prev.filter((id) => delGrupo.includes(id));
            if (grupo.max === 1) return [...prev.filter((id) => !delGrupo.includes(id)), opcionId];
            if (elegidas.length >= grupo.max) return prev;
            return [...prev, opcionId];
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={producto.nombre}>
            <button type="button" aria-label="Cerrar" onClick={onCerrar} className="absolute inset-0 bg-tinta/55 backdrop-blur-[2px] animate-in fade-in" />

            <div className="relative flex max-h-[94svh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[32px] bg-hueso animate-in slide-in-from-bottom-10 duration-300 md:max-h-[90svh] md:rounded-[32px]">
                <div className="flex justify-center pt-3 pb-1 md:hidden">
                    <span className="h-[5px] w-11 rounded-full bg-tinta/20" />
                </div>
                <button
                    type="button"
                    onClick={onCerrar}
                    aria-label="Cerrar"
                    className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-white/90 text-tinta shadow-sm"
                >
                    <X className="size-5" />
                </button>

                <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
                    <div className="relative h-[230px] overflow-hidden rounded-[28px] bg-white" style={{ background: GLOW[producto.color] ?? GLOW.turquesa }}>
                        {producto.imagen_url ? (
                            <img src={producto.imagen_url} alt={producto.nombre} className="absolute inset-0 m-auto h-[88%] w-[88%] object-contain drop-shadow-[0_18px_24px_rgba(11,46,54,0.25)]" />
                        ) : (
                            <span className="absolute inset-0 grid place-items-center text-7xl">🍨</span>
                        )}
                    </div>

                    <div className="mt-5 flex flex-col gap-1.5">
                        <EtiquetaBadge etiqueta={producto.etiqueta === 'combo' ? null : producto.etiqueta} />
                        <h2 className="font-display text-[32px] leading-[1.02] font-extrabold tracking-[-0.04em] text-tinta">{producto.nombre}</h2>
                        {producto.descripcion && <p className="text-[15px] leading-[1.45] font-medium text-tinta/70">{producto.descripcion}</p>}
                        <p className="font-display mt-0.5 text-base font-bold text-tinta">
                            {producto.tamanos.length > 1 ? 'Desde ' : ''}
                            {formatPrice(desde)}
                        </p>
                    </div>

                    {producto.tamanos.length > 0 && (
                        <section className="mt-6 flex flex-col gap-2.5">
                            <EncabezadoGrupo titulo="Tamaño" chip="Obligatorio" chipOscuro />
                            {producto.tamanos.map((t) => (
                                <Opcion
                                    key={t.id}
                                    tipo="radio"
                                    activo={tamanoId === t.id}
                                    titulo={t.nombre}
                                    precio={precioExtra(t.ajuste)}
                                    onClick={() => setTamanoId(t.id)}
                                />
                            ))}
                        </section>
                    )}

                    {producto.grupos.map((g) => {
                        const elegidas = g.opciones.filter((o) => opciones.includes(o.id)).length;
                        const completo = elegidas >= g.max || (!g.obligatorio && elegidas > 0);

                        return (
                            <section key={g.id} className="mt-6 flex flex-col gap-2.5">
                                <EncabezadoGrupo
                                    titulo={g.nombre}
                                    chip={g.obligatorio ? `${elegidas} de ${g.max}${elegidas >= g.max ? ' ✓' : ''}` : 'Opcional'}
                                    chipOscuro={g.obligatorio && completo}
                                />
                                {g.tipo === 'sabor' ? (
                                    <div className="flex flex-wrap gap-2">
                                        {g.opciones.map((o) => {
                                            const activo = opciones.includes(o.id);
                                            return (
                                                <TagSabor
                                                    key={o.id}
                                                    activo={activo}
                                                    disabled={!activo && g.max > 1 && elegidas >= g.max}
                                                    onClick={() => alternar(g.id, o.id)}
                                                >
                                                    {o.nombre}
                                                </TagSabor>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    g.opciones.map((o) => {
                                        const activo = opciones.includes(o.id);
                                        return (
                                            <Opcion
                                                key={o.id}
                                                tipo={g.max === 1 ? 'radio' : 'check'}
                                                activo={activo}
                                                disabled={!activo && g.max > 1 && elegidas >= g.max}
                                                titulo={o.nombre}
                                                precio={precioExtra(o.precio)}
                                                onClick={() => alternar(g.id, o.id)}
                                            />
                                        );
                                    })
                                )}
                            </section>
                        );
                    })}

                    {sugerencias.length > 0 && (
                        <section className="mt-6">
                            <h3 className="font-display mb-2.5 text-lg font-bold tracking-[-0.02em] text-tinta">Va perfecto con</h3>
                            <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-none">
                                {sugerencias.map((s) => (
                                    <MiniSugerencia
                                        key={s.id}
                                        producto={s}
                                        prefijoPrecio="+ "
                                        onAbrir={() => onAbrirOtro(s)}
                                        onAgregar={() => onAgregarRapido(s)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="flex items-center gap-3 border-t border-tinta/8 bg-white px-4 pt-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
                    <Stepper
                        cantidad={cantidad}
                        onMas={() => setCantidad((c) => Math.min(30, c + 1))}
                        onMenos={() => setCantidad((c) => Math.max(1, c - 1))}
                        className="bg-tinta"
                    />
                    <Cta
                        accion={pendiente ? pendiente.nombre : 'Agregar'}
                        total={formatPrice(precio * cantidad)}
                        disabled={!!pendiente}
                        onClick={() => onAgregar(tamanoId, opciones, cantidad)}
                    />
                </div>
            </div>
        </div>
    );
}

function EncabezadoGrupo({ titulo, chip, chipOscuro }: { titulo: string; chip: string; chipOscuro?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-tinta">{titulo}</h3>
            <span
                className={cn(
                    'text-meta rounded-full px-2.5 py-[5px] text-[10px]',
                    chipOscuro ? 'bg-tinta text-white' : 'bg-tinta/8 text-tinta/70',
                )}
            >
                {chip}
            </span>
        </div>
    );
}
