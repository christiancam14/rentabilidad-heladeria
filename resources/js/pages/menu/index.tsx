import { Head, router } from '@inertiajs/react';
import { ArrowRight, ChevronDown, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { Chip } from '@/components/brand/chip';
import { Logo } from '@/components/brand/logo';
import { ProductoFoto } from '@/components/brand/producto-foto';
import { Carrito, type DatosCliente } from '@/components/menu/carrito';
import { FichaProducto } from '@/components/menu/ficha-producto';
import { FilaProducto, MiniSugerencia, Stepper } from '@/components/menu/piezas';
import { formatPrice } from '@/lib/format-price';
import { claveLinea, cotizar, guardarLocal, leerLocal, reconciliarCarrito, requiereFicha } from '@/lib/menu';
import { cn } from '@/lib/utils';
import { type LineaCarrito, type MenuCategoria, type MenuProducto, type MenuReglas, type MenuSede } from '@/types/menu';

interface Props {
    negocio: { nombre: string; eslogan: string };
    sedes: MenuSede[];
    sede_id: number;
    categorias: MenuCategoria[];
    productos: MenuProducto[];
    mas_pedidos: number[];
    combo_id: number | null;
    sugeridos: number[];
    reglas: MenuReglas;
}

const CLAVE_CLIENTE = 'atg-cliente';

export default function MenuDigital({ negocio, sedes, sede_id, categorias, productos, mas_pedidos, combo_id, sugeridos, reglas }: Props) {
    const sede = sedes.find((s) => s.id === sede_id)!;
    const claveCarrito = `atg-carrito-${sede_id}`;

    const [lineas, setLineas] = useState<LineaCarrito[]>([]);
    const [cargado, setCargado] = useState(false);
    const [vista, setVista] = useState<'menu' | 'carrito'>('menu');
    const [abierto, setAbierto] = useState<MenuProducto | null>(null);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState<number | null>(categorias[0]?.id ?? null);
    const [cliente, setCliente] = useState<DatosCliente>({ nombre: '', telefono: '', metodo_pago: reglas.pagos[0]?.key ?? 'caja', notas: '' });
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [enviando, setEnviando] = useState(false);
    const seccionesRef = useRef<Record<number, HTMLElement | null>>({});
    const chipsRef = useRef<HTMLDivElement>(null);

    // Carrito y datos del cliente persisten en el navegador
    useEffect(() => {
        setLineas(reconciliarCarrito(leerLocal<LineaCarrito[]>(claveCarrito, []), productos));
        const guardado = leerLocal<Partial<DatosCliente>>(CLAVE_CLIENTE, {});
        setCliente((c) => ({
            ...c,
            nombre: guardado.nombre ?? '',
            telefono: guardado.telefono ?? '',
            metodo_pago: reglas.pagos.some((p) => p.key === guardado.metodo_pago) ? guardado.metodo_pago! : c.metodo_pago,
        }));
        setCargado(true);
    }, [claveCarrito, productos, reglas.pagos]);

    useEffect(() => {
        if (cargado) guardarLocal(claveCarrito, lineas);
    }, [lineas, cargado, claveCarrito]);

    useEffect(() => {
        if (cargado) guardarLocal(CLAVE_CLIENTE, { nombre: cliente.nombre, telefono: cliente.telefono, metodo_pago: cliente.metodo_pago });
    }, [cliente, cargado]);

    const porId = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);
    const enCarrito = useMemo(() => {
        const m = new Map<number, number>();
        lineas.forEach((l) => m.set(l.producto_id, (m.get(l.producto_id) ?? 0) + l.cantidad));
        return m;
    }, [lineas]);

    const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
    const subtotal = lineas.reduce((s, l) => s + l.precio_unitario * l.cantidad, 0);

    const agregar = useCallback(
        (p: MenuProducto, tamanoId: number | null, opciones: number[], cantidad = 1) => {
            const key = claveLinea(p.id, tamanoId, opciones);
            const { precio, detalle } = cotizar(p, tamanoId, opciones);
            setLineas((prev) => {
                const existe = prev.find((l) => l.key === key);
                if (existe) return prev.map((l) => (l.key === key ? { ...l, cantidad: Math.min(30, l.cantidad + cantidad) } : l));
                return [...prev, { key, producto_id: p.id, cantidad, tamano_id: tamanoId, opciones, nombre: p.nombre, detalle, precio_unitario: precio }];
            });
        },
        [],
    );

    const agregarRapido = useCallback(
        (p: MenuProducto) => {
            if (p.agotado) return;
            if (requiereFicha(p)) {
                setAbierto(p);
                return;
            }
            agregar(p, null, []);
            toast.success(`${p.nombre} agregado`, { id: `add-${p.id}`, duration: 1500 });
        },
        [agregar],
    );

    /** El − de una fila descuenta la última línea agregada de ese producto. */
    const quitarUno = (productoId: number) => {
        setLineas((prev) => {
            const idx = prev.map((l) => l.producto_id).lastIndexOf(productoId);
            if (idx < 0) return prev;
            const l = prev[idx];
            return l.cantidad > 1 ? prev.map((x, i) => (i === idx ? { ...x, cantidad: x.cantidad - 1 } : x)) : prev.filter((_, i) => i !== idx);
        });
    };

    const cambiarCantidad = (key: string, cantidad: number) =>
        setLineas((prev) => (cantidad <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, cantidad: Math.min(30, cantidad) } : l))));

    const cambiarSede = (slug: string) => router.get('/', { sede: slug }, { preserveScroll: false });

    const enviar = (cupon: string | null) => {
        setErrores({});
        router.post(
            '/pedidos',
            {
                sede_id,
                cliente_nombre: cliente.nombre,
                cliente_telefono: cliente.telefono,
                metodo_pago: cliente.metodo_pago,
                notas: cliente.notas || null,
                cupon,
                items: lineas.map((l) => ({ producto_id: l.producto_id, cantidad: l.cantidad, tamano_id: l.tamano_id, opciones: l.opciones })),
            },
            {
                onStart: () => setEnviando(true),
                onFinish: () => setEnviando(false),
                onSuccess: () => {
                    guardarLocal(claveCarrito, []);
                },
                onError: (errs) => {
                    setErrores(errs);
                    toast.error(Object.values(errs)[0] ?? 'Revisa tu pedido');
                },
            },
        );
    };

    // Resalta el chip de la categoría visible al hacer scroll
    useEffect(() => {
        if (vista !== 'menu' || busqueda) return;
        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
                if (visible) setCategoriaActiva(Number(visible.target.getAttribute('data-categoria')));
            },
            { rootMargin: '-120px 0px -60% 0px' },
        );
        Object.values(seccionesRef.current).forEach((el) => el && obs.observe(el));
        return () => obs.disconnect();
    }, [vista, busqueda, categorias]);

    useEffect(() => {
        const chip = chipsRef.current?.querySelector<HTMLElement>(`[data-chip="${categoriaActiva}"]`);
        chip?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }, [categoriaActiva]);

    const irACategoria = (id: number) => {
        setBusqueda('');
        setCategoriaActiva(id);
        requestAnimationFrame(() => {
            const el = seccionesRef.current[id];
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84, behavior: 'smooth' });
        });
    };

    const termino = busqueda.trim().toLowerCase();
    const resultados = termino
        ? productos.filter((p) => `${p.nombre} ${p.descripcion ?? ''}`.toLowerCase().includes(termino))
        : [];

    const masPedidos = mas_pedidos.map((id) => porId.get(id)).filter((p): p is MenuProducto => !!p && !p.agotado);
    const combo = combo_id ? porId.get(combo_id) : undefined;
    const sugerencias = (excluir: number[]) =>
        sugeridos
            .map((id) => porId.get(id))
            .filter((p): p is MenuProducto => !!p && !excluir.includes(p.id))
            .slice(0, 6);

    const ficha = abierto && (
        <FichaProducto
            key={abierto.id}
            producto={abierto}
            sugerencias={reglas.sugerencias_producto ? sugerencias([abierto.id]).slice(0, 4) : []}
            onCerrar={() => setAbierto(null)}
            onAbrirOtro={(p) => setAbierto(p)}
            onAgregarRapido={agregarRapido}
            onAgregar={(tamanoId, opciones, cantidad) => {
                agregar(abierto, tamanoId, opciones, cantidad);
                toast.success(`${abierto.nombre} agregado`, { duration: 1500 });
                setAbierto(null);
            }}
        />
    );

    return (
        <>
            <Head title="Menú · Pide para recoger">
                <meta name="description" content={`${negocio.nombre}: pide tu helado y recógelo en ${sede.nombre}.`} />
            </Head>

            <div className="min-h-svh bg-arena text-tinta">
                <div className="relative mx-auto min-h-svh w-full max-w-[480px] bg-hueso md:shadow-[0_0_80px_-20px_rgba(11,46,54,0.25)]">
                    {vista === 'carrito' ? (
                        <Carrito
                            sede={sede}
                            lineas={lineas}
                            productos={productos}
                            sugerencias={sugerencias(lineas.map((l) => l.producto_id))}
                            reglas={reglas}
                            cliente={cliente}
                            errores={errores}
                            enviando={enviando}
                            onCliente={setCliente}
                            onCantidad={cambiarCantidad}
                            onVolver={() => setVista('menu')}
                            onAbrir={setAbierto}
                            onAgregarRapido={agregarRapido}
                            onEnviar={enviar}
                        />
                    ) : (
                        <div className="px-4 pt-6 pb-32">
                            {/* Pedido / Encabezado sede */}
                            <header className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Logo className="w-11" />
                                    <div>
                                        <p className="text-meta text-tinta/60">Recoger en</p>
                                        <div className="relative">
                                            <select
                                                aria-label="Elegir sede"
                                                value={sede.slug}
                                                onChange={(e) => cambiarSede(e.target.value)}
                                                className="font-display cursor-pointer appearance-none bg-transparent pr-5 text-lg leading-[1.05] font-bold tracking-[-0.02em] outline-none"
                                            >
                                                {sedes.map((s) => (
                                                    <option key={s.id} value={s.slug}>
                                                        {s.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>
                                <span
                                    className={cn(
                                        'text-meta rounded-full px-3 py-2',
                                        sede.recibiendo_pedidos ? 'bg-turquesa-suave' : 'bg-rosa-suave',
                                    )}
                                >
                                    {sede.recibiendo_pedidos ? `⏱ Listo en ${sede.tiempo_preparacion} min` : 'Cerrado ahora'}
                                </span>
                            </header>

                            {!sede.recibiendo_pedidos && (
                                <p className="mt-4 rounded-[18px] bg-rosa-suave/60 px-4 py-3 text-sm font-medium">
                                    {sede.nombre} no está recibiendo pedidos en este momento. Puedes mirar el menú y armar tu pedido.
                                </p>
                            )}

                            <h1 className="font-display mt-5 text-[44px] leading-[0.9] font-extrabold tracking-[-0.04em]">
                                ¿Qué se te
                                <br />
                                <span className="font-serif font-normal tracking-[-0.02em] text-rosa italic">antoja hoy?</span>
                            </h1>

                            <label className="mt-5 flex h-[52px] items-center gap-2.5 rounded-full border border-tinta/10 bg-white px-[18px]">
                                <Search className="size-[18px] text-tinta/45" />
                                <input
                                    type="search"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="Busca un sabor o producto"
                                    className="h-full flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-tinta/45"
                                />
                            </label>

                            {termino ? (
                                <section className="mt-6">
                                    <p className="text-meta text-tinta/55">
                                        {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'}
                                    </p>
                                    {resultados.length === 0 && (
                                        <p className="mt-6 text-center text-[15px] text-tinta/60">No encontramos “{busqueda}”. Prueba con otro sabor 🍦</p>
                                    )}
                                    {resultados.map((p) => (
                                        <FilaProducto
                                            key={p.id}
                                            producto={p}
                                            cantidad={enCarrito.get(p.id) ?? 0}
                                            onAbrir={() => !p.agotado && setAbierto(p)}
                                            onMas={() => agregarRapido(p)}
                                            onMenos={() => quitarUno(p.id)}
                                        />
                                    ))}
                                </section>
                            ) : (
                                <>
                                    {masPedidos.length > 0 && (
                                        <section className="mt-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="font-display text-lg font-bold tracking-[-0.02em]">🔥 Lo más pedido</h2>
                                                <button
                                                    type="button"
                                                    className="text-meta text-rosa"
                                                    onClick={() => categorias[0] && irACategoria(categorias[0].id)}
                                                >
                                                    Ver todo
                                                </button>
                                            </div>
                                            <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
                                                {masPedidos.map((p) => (
                                                    <MiniSugerencia
                                                        key={p.id}
                                                        producto={p}
                                                        ancho="w-[161px]"
                                                        onAbrir={() => setAbierto(p)}
                                                        onAgregar={() => agregarRapido(p)}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {combo && !combo.agotado && (
                                        <section
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setAbierto(combo)}
                                            onKeyDown={(e) => e.key === 'Enter' && setAbierto(combo)}
                                            className="mt-5 flex cursor-pointer items-center gap-3 rounded-[24px] bg-turquesa p-5 text-white"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-meta text-white/85">
                                                    Combo
                                                    {combo.precio_anterior && combo.precio_anterior > combo.precio
                                                        ? ` · ahorra ${formatPrice(combo.precio_anterior - combo.precio)}`
                                                        : ''}
                                                </p>
                                                <p className="font-display mt-1.5 text-[22px] leading-[1.05] font-bold tracking-[-0.02em]">{combo.nombre}</p>
                                                {combo.descripcion && <p className="mt-1 line-clamp-2 text-sm font-medium text-white/90">{combo.descripcion}</p>}
                                                <p className="font-display mt-1.5 text-lg font-bold">
                                                    {formatPrice(combo.precio)}
                                                    {combo.precio_anterior ? (
                                                        <span className="ml-2 font-sans text-sm font-medium text-white/70 line-through">
                                                            {formatPrice(combo.precio_anterior)}
                                                        </span>
                                                    ) : null}
                                                </p>
                                            </div>
                                            <ProductoFoto src={combo.imagen_url} color="blanco" className="size-[68px] shrink-0 rounded-full" />
                                            <Stepper cantidad={0} onMas={() => agregarRapido(combo)} />
                                        </section>
                                    )}

                                    {/* Categorías (sticky) */}
                                    <div className="sticky top-0 z-20 -mx-4 mt-5 bg-hueso/95 py-3 backdrop-blur">
                                        <div ref={chipsRef} className="flex gap-2 overflow-x-auto px-4 scrollbar-none">
                                            {categorias.map((c) => (
                                                <Chip
                                                    key={c.id}
                                                    data-chip={c.id}
                                                    activo={categoriaActiva === c.id}
                                                    emoji={c.emoji}
                                                    contador={productos.filter((p) => p.categoria_id === c.id).length}
                                                    onClick={() => irACategoria(c.id)}
                                                >
                                                    {c.nombre}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>

                                    {categorias.map((c) => (
                                        <section
                                            key={c.id}
                                            data-categoria={c.id}
                                            ref={(el) => {
                                                seccionesRef.current[c.id] = el;
                                            }}
                                            className="mt-4 scroll-mt-24"
                                        >
                                            <h2 className="font-display text-[26px] font-extrabold tracking-[-0.03em]">{c.nombre}</h2>
                                            <div className="mt-1">
                                                {productos
                                                    .filter((p) => p.categoria_id === c.id)
                                                    .map((p) => (
                                                        <FilaProducto
                                                            key={p.id}
                                                            producto={p}
                                                            cantidad={enCarrito.get(p.id) ?? 0}
                                                            onAbrir={() => !p.agotado && setAbierto(p)}
                                                            onMas={() => agregarRapido(p)}
                                                            onMenos={() => quitarUno(p.id)}
                                                        />
                                                    ))}
                                            </div>
                                        </section>
                                    ))}

                                    <footer className="mt-12 flex flex-col items-center gap-2 text-center">
                                        <Logo className="w-20 opacity-90" />
                                        <p className="text-meta text-tinta/45">{negocio.nombre}</p>
                                        {sede.direccion && <p className="text-xs text-tinta/50">{sede.direccion}</p>}
                                    </footer>
                                </>
                            )}

                            {/* Web / Barra pedido */}
                            {unidades > 0 && (
                                <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
                                    <button
                                        type="button"
                                        onClick={() => setVista('carrito')}
                                        className="flex h-[62px] w-full items-center justify-between rounded-[22px] bg-tinta pr-2 pl-6 text-left text-white shadow-[0_18px_40px_-12px_rgba(11,46,54,0.55)] animate-in slide-in-from-bottom-4"
                                    >
                                        <span className="flex flex-col">
                                            <span className="text-meta text-white/65">
                                                {unidades} {unidades === 1 ? 'producto' : 'productos'}
                                            </span>
                                            <span className="font-display text-xl leading-none font-bold tracking-[-0.02em] tabular-nums">
                                                {formatPrice(subtotal)}
                                            </span>
                                        </span>
                                        <span className="font-display flex h-[46px] items-center gap-2 rounded-full bg-rosa px-5 text-[15px] font-bold">
                                            Ver pedido <ArrowRight className="size-4" strokeWidth={3} />
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {ficha}
        </>
    );
}
