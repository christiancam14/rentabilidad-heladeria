import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronDown,
    MapPin,
    Search,
    ShoppingBag,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { Chip } from '@/components/brand/chip';
import { Credito } from '@/components/brand/credito';
import { Logo } from '@/components/brand/logo';
import { ProductoFoto } from '@/components/brand/producto-foto';
import { IconoWhatsapp, RedesSociales } from '@/components/brand/redes';
import { Carrito, type DatosCliente } from '@/components/menu/carrito';
import { FichaProducto } from '@/components/menu/ficha-producto';
import {
    Cta,
    FilaProducto,
    MetaRegalo,
    MiniSugerencia,
    Stepper,
    TarjetaProducto,
} from '@/components/menu/piezas';
import { formatPrice } from '@/lib/format-price';
import {
    claveLinea,
    cotizar,
    guardarLocal,
    leerLocal,
    reconciliarCarrito,
    requiereFicha,
} from '@/lib/menu';
import { cn } from '@/lib/utils';
import {
    type LineaCarrito,
    type MenuCategoria,
    type MenuProducto,
    type MenuReglas,
    type MenuSede,
    type Negocio,
} from '@/types/menu';

interface Props {
    negocio: Negocio;
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

export default function MenuDigital({
    negocio,
    sedes,
    sede_id,
    categorias,
    productos,
    mas_pedidos,
    combo_id,
    sugeridos,
    reglas,
}: Props) {
    const sede = sedes.find((s) => s.id === sede_id)!;
    const claveCarrito = `atg-carrito-${sede_id}`;

    const [lineas, setLineas] = useState<LineaCarrito[]>([]);
    const [cargado, setCargado] = useState(false);
    const [vista, setVista] = useState<'menu' | 'carrito'>('menu');
    // Fichas abiertas como pila: una sugerencia se abre encima sin perder lo que el cliente ya eligió
    const [pila, setPila] = useState<MenuProducto[]>([]);
    const setAbierto = (p: MenuProducto | null) => setPila(p ? [p] : []);
    const apilar = (p: MenuProducto) =>
        setPila((prev) => [...prev.filter((x) => x.id !== p.id), p]);
    const cerrarFicha = () => setPila((prev) => prev.slice(0, -1));
    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState<number | null>(
        categorias[0]?.id ?? null,
    );
    const [cliente, setCliente] = useState<DatosCliente>({
        nombre: '',
        telefono: '',
        metodo_pago: reglas.pagos[0]?.key ?? 'caja',
        notas: '',
    });
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [enviando, setEnviando] = useState(false);
    const seccionesRef = useRef<Record<number, HTMLElement | null>>({});
    const chipsRef = useRef<HTMLDivElement>(null);

    // Carrito y datos del cliente persisten en el navegador
    useEffect(() => {
        setLineas(
            reconciliarCarrito(
                leerLocal<LineaCarrito[]>(claveCarrito, []),
                productos,
            ),
        );
        const guardado = leerLocal<Partial<DatosCliente>>(CLAVE_CLIENTE, {});
        setCliente((c) => ({
            ...c,
            nombre: guardado.nombre ?? '',
            telefono: guardado.telefono ?? '',
            metodo_pago: reglas.pagos.some(
                (p) => p.key === guardado.metodo_pago,
            )
                ? guardado.metodo_pago!
                : c.metodo_pago,
        }));
        setCargado(true);
    }, [claveCarrito, productos, reglas.pagos]);

    useEffect(() => {
        if (cargado) guardarLocal(claveCarrito, lineas);
    }, [lineas, cargado, claveCarrito]);

    useEffect(() => {
        if (cargado)
            guardarLocal(CLAVE_CLIENTE, {
                nombre: cliente.nombre,
                telefono: cliente.telefono,
                metodo_pago: cliente.metodo_pago,
            });
    }, [cliente, cargado]);

    const porId = useMemo(
        () => new Map(productos.map((p) => [p.id, p])),
        [productos],
    );
    const enCarrito = useMemo(() => {
        const m = new Map<number, number>();
        lineas.forEach((l) =>
            m.set(l.producto_id, (m.get(l.producto_id) ?? 0) + l.cantidad),
        );
        return m;
    }, [lineas]);

    const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
    const subtotal = lineas.reduce(
        (s, l) => s + l.precio_unitario * l.cantidad,
        0,
    );

    const agregar = useCallback(
        (
            p: MenuProducto,
            tamanoId: number | null,
            opciones: number[],
            cantidad = 1,
        ) => {
            const key = claveLinea(p.id, tamanoId, opciones);
            const { precio, detalle } = cotizar(p, tamanoId, opciones);
            setLineas((prev) => {
                const existe = prev.find((l) => l.key === key);
                if (existe)
                    return prev.map((l) =>
                        l.key === key
                            ? {
                                  ...l,
                                  cantidad: Math.min(30, l.cantidad + cantidad),
                              }
                            : l,
                    );
                return [
                    ...prev,
                    {
                        key,
                        producto_id: p.id,
                        cantidad,
                        tamano_id: tamanoId,
                        opciones,
                        nombre: p.nombre,
                        detalle,
                        precio_unitario: precio,
                    },
                ];
            });
        },
        [],
    );

    const agregarRapido = useCallback(
        (p: MenuProducto, desdeFicha = false) => {
            if (p.agotado) return;
            if (requiereFicha(p)) {
                setPila((prev) =>
                    desdeFicha
                        ? [...prev.filter((x) => x.id !== p.id), p]
                        : [p],
                );
                return;
            }
            agregar(p, null, []);
            toast.success(`${p.nombre} agregado`, {
                id: `add-${p.id}`,
                duration: 1500,
            });
        },
        [agregar],
    );

    /** El − de una fila descuenta la última línea agregada de ese producto. */
    const quitarUno = (productoId: number) => {
        setLineas((prev) => {
            const idx = prev.map((l) => l.producto_id).lastIndexOf(productoId);
            if (idx < 0) return prev;
            const l = prev[idx];
            return l.cantidad > 1
                ? prev.map((x, i) =>
                      i === idx ? { ...x, cantidad: x.cantidad - 1 } : x,
                  )
                : prev.filter((_, i) => i !== idx);
        });
    };

    const cambiarCantidad = (key: string, cantidad: number) =>
        setLineas((prev) =>
            cantidad <= 0
                ? prev.filter((l) => l.key !== key)
                : prev.map((l) =>
                      l.key === key
                          ? { ...l, cantidad: Math.min(30, cantidad) }
                          : l,
                  ),
        );

    const cambiarSede = (slug: string) =>
        router.get('/', { sede: slug }, { preserveScroll: false });

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
                items: lineas.map((l) => ({
                    producto_id: l.producto_id,
                    cantidad: l.cantidad,
                    tamano_id: l.tamano_id,
                    opciones: l.opciones,
                })),
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
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    )[0];
                if (visible)
                    setCategoriaActiva(
                        Number(visible.target.getAttribute('data-categoria')),
                    );
            },
            { rootMargin: '-180px 0px -55% 0px' },
        );
        Object.values(seccionesRef.current).forEach(
            (el) => el && obs.observe(el),
        );
        return () => obs.disconnect();
    }, [vista, busqueda, categorias]);

    useEffect(() => {
        const chip = chipsRef.current?.querySelector<HTMLElement>(
            `[data-chip="${categoriaActiva}"]`,
        );
        chip?.scrollIntoView({
            inline: 'center',
            block: 'nearest',
            behavior: 'smooth',
        });
    }, [categoriaActiva]);

    const irACategoria = (id: number) => {
        setBusqueda('');
        setCategoriaActiva(id);
        requestAnimationFrame(() => {
            const el = seccionesRef.current[id];
            if (el) {
                const offset = window.matchMedia('(min-width: 768px)').matches
                    ? 160
                    : 84;
                window.scrollTo({
                    top:
                        el.getBoundingClientRect().top +
                        window.scrollY -
                        offset,
                    behavior: 'smooth',
                });
            }
        });
    };

    const termino = busqueda.trim().toLowerCase();
    const resultados = termino
        ? productos.filter((p) =>
              `${p.nombre} ${p.descripcion ?? ''}`
                  .toLowerCase()
                  .includes(termino),
          )
        : [];

    const masPedidos = mas_pedidos
        .map((id) => porId.get(id))
        .filter((p): p is MenuProducto => !!p && !p.agotado);
    const combo = combo_id ? porId.get(combo_id) : undefined;
    const sugerencias = (excluir: number[]) =>
        sugeridos
            .map((id) => porId.get(id))
            .filter((p): p is MenuProducto => !!p && !excluir.includes(p.id))
            .slice(0, 6);

    const fichas = pila.map((p, i) => {
        const esTope = i === pila.length - 1;
        return (
            <FichaProducto
                key={p.id}
                producto={p}
                oculta={!esTope}
                volverA={i > 0 ? pila[i - 1].nombre : null}
                sugerencias={
                    reglas.sugerencias_producto
                        ? sugerencias(pila.map((x) => x.id)).slice(0, 4)
                        : []
                }
                onCerrar={cerrarFicha}
                onAbrirOtro={apilar}
                onAgregarRapido={(s) => agregarRapido(s, true)}
                onAgregar={(tamanoId, opciones, cantidad) => {
                    agregar(p, tamanoId, opciones, cantidad);
                    toast.success(
                        i > 0
                            ? `${p.nombre} agregado · sigue con ${pila[i - 1].nombre}`
                            : `${p.nombre} agregado`,
                        { duration: 2000 },
                    );
                    cerrarFicha();
                }}
            />
        );
    });

    const filas = (lista: MenuProducto[]) => (
        <>
            {/* Móvil: filas como en el Figma */}
            <div className="md:hidden">
                {lista.map((p) => (
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
            {/* Tablet y escritorio: grilla de tarjetas */}
            <div className="hidden gap-4 md:grid md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {lista.map((p) => (
                    <TarjetaProducto
                        key={p.id}
                        producto={p}
                        cantidad={enCarrito.get(p.id) ?? 0}
                        onAbrir={() => !p.agotado && setAbierto(p)}
                        onMas={() => agregarRapido(p)}
                        onMenos={() => quitarUno(p.id)}
                    />
                ))}
            </div>
        </>
    );

    const selectorSede = (
        <div className="min-w-0">
            <p className="text-meta whitespace-nowrap text-tinta/60">
                Recoger en
            </p>
            <div className="relative">
                <select
                    aria-label="Elegir sede"
                    value={sede.slug}
                    onChange={(e) => cambiarSede(e.target.value)}
                    className="max-w-full cursor-pointer appearance-none truncate bg-transparent pr-5 font-display text-lg leading-[1.05] font-bold tracking-[-0.02em] outline-none"
                >
                    {sedes.map((s) => (
                        <option key={s.id} value={s.slug}>
                            {s.nombre}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2"
                    strokeWidth={2.5}
                />
            </div>
        </div>
    );

    const badgeTiempo = (
        <span
            className={cn(
                'shrink-0 rounded-full px-3 py-2 text-meta whitespace-nowrap md:hidden xl:inline',
                sede.recibiendo_pedidos ? 'bg-turquesa-suave' : 'bg-rosa-suave',
            )}
        >
            {sede.recibiendo_pedidos
                ? `⏱ Listo en ${sede.tiempo_preparacion} min`
                : 'Cerrado ahora'}
        </span>
    );

    const buscador = (clase: string) => (
        <label
            className={cn(
                'flex h-[52px] items-center gap-2.5 rounded-full border border-tinta/10 bg-white px-[18px]',
                clase,
            )}
        >
            <Search className="size-[18px] text-tinta/45" />
            <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Busca un sabor o producto"
                className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-tinta/45"
            />
        </label>
    );

    return (
        <>
            <Head title="Menú · Pide para recoger">
                <meta
                    name="description"
                    content={`${negocio.nombre}: pide tu helado y recógelo en ${sede.nombre}.`}
                />
            </Head>

            <div className="min-h-svh bg-hueso text-tinta">
                {vista === 'carrito' ? (
                    <Carrito
                        sede={sede}
                        lineas={lineas}
                        productos={productos}
                        sugerencias={sugerencias(
                            lineas.map((l) => l.producto_id),
                        )}
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
                    <>
                        {/* Pedido / Encabezado sede — en tablet y escritorio es una barra fija con buscador y carrito */}
                        <header className="md:sticky md:top-0 md:z-30 md:border-b md:border-tinta/8 md:bg-hueso/90 md:backdrop-blur">
                            <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 pt-6 md:h-[76px] md:gap-6 md:px-8 md:pt-0">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Logo className="w-11 shrink-0 md:w-12" />
                                    {selectorSede}
                                </div>
                                {buscador(
                                    'hidden max-w-[440px] flex-1 md:flex',
                                )}
                                <div className="flex shrink-0 items-center gap-3">
                                    {badgeTiempo}
                                    <button
                                        type="button"
                                        onClick={() => setVista('carrito')}
                                        className="relative hidden h-11 items-center gap-2 rounded-full bg-tinta pr-4 pl-3.5 font-display text-sm font-bold text-hueso md:flex lg:hidden"
                                    >
                                        <ShoppingBag className="size-[18px]" />
                                        {unidades > 0
                                            ? formatPrice(subtotal)
                                            : 'Tu pedido'}
                                        {unidades > 0 && (
                                            <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-rosa text-[11px] text-white">
                                                {unidades}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </header>

                        <div className="mx-auto max-w-[1280px] px-4 pb-32 md:px-8 md:pt-8 lg:pb-16">
                            {!sede.recibiendo_pedidos && (
                                <p className="mt-4 rounded-[18px] bg-rosa-suave/60 px-4 py-3 text-sm font-medium md:mt-0 md:mb-6">
                                    {sede.nombre} no está recibiendo pedidos en
                                    este momento. Puedes mirar el menú y armar
                                    tu pedido.
                                </p>
                            )}

                            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
                                <main className="min-w-0">
                                    {/* Héroe: título + combo destacado */}
                                    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-end xl:gap-8">
                                        <div>
                                            <h1 className="mt-5 font-display text-[44px] leading-[0.9] font-extrabold tracking-[-0.04em] md:mt-0 md:text-[64px] xl:text-[76px]">
                                                ¿Qué se te
                                                <br />
                                                <span className="font-serif font-normal tracking-[-0.02em] text-rosa italic">
                                                    antoja hoy?
                                                </span>
                                            </h1>
                                            {buscador('mt-5 md:hidden')}
                                        </div>

                                        {!termino &&
                                            combo &&
                                            !combo.agotado && (
                                                <section
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() =>
                                                        setAbierto(combo)
                                                    }
                                                    onKeyDown={(e) =>
                                                        e.key === 'Enter' &&
                                                        setAbierto(combo)
                                                    }
                                                    className="mt-5 hidden cursor-pointer items-center gap-3 rounded-[24px] bg-turquesa p-5 text-white transition-transform hover:-translate-y-0.5 md:mt-8 md:flex md:p-6 xl:mt-0"
                                                >
                                                    <ComboContenido
                                                        combo={combo}
                                                        onAgregar={() =>
                                                            agregarRapido(combo)
                                                        }
                                                    />
                                                </section>
                                            )}
                                    </div>

                                    {termino ? (
                                        <section className="mt-6 md:mt-10">
                                            <p className="mb-2 text-meta text-tinta/55">
                                                {resultados.length}{' '}
                                                {resultados.length === 1
                                                    ? 'resultado'
                                                    : 'resultados'}{' '}
                                                para “{busqueda}”
                                            </p>
                                            {resultados.length === 0 && (
                                                <p className="mt-6 text-center text-[15px] text-tinta/60">
                                                    No encontramos “{busqueda}”.
                                                    Prueba con otro sabor 🍦
                                                </p>
                                            )}
                                            {filas(resultados)}
                                        </section>
                                    ) : (
                                        <>
                                            {masPedidos.length > 0 && (
                                                <section className="mt-6 md:mt-10">
                                                    <div className="flex items-center justify-between">
                                                        <h2 className="font-display text-lg font-bold tracking-[-0.02em] md:text-[22px]">
                                                            🔥 Lo más pedido
                                                        </h2>
                                                        <button
                                                            type="button"
                                                            className="text-meta text-rosa"
                                                            onClick={() =>
                                                                categorias[0] &&
                                                                irACategoria(
                                                                    categorias[0]
                                                                        .id,
                                                                )
                                                            }
                                                        >
                                                            Ver todo
                                                        </button>
                                                    </div>
                                                    <div className="-mx-4 mt-4 scrollbar-none flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
                                                        {masPedidos.map(
                                                            (p, i) => (
                                                                <MiniSugerencia
                                                                    key={p.id}
                                                                    producto={p}
                                                                    ancho={cn(
                                                                        'w-[161px] md:w-auto',
                                                                        i >=
                                                                            4 &&
                                                                            'md:hidden',
                                                                    )}
                                                                    onAbrir={() =>
                                                                        setAbierto(
                                                                            p,
                                                                        )
                                                                    }
                                                                    onAgregar={() =>
                                                                        agregarRapido(
                                                                            p,
                                                                        )
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                </section>
                                            )}

                                            {combo && !combo.agotado && (
                                                <section
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() =>
                                                        setAbierto(combo)
                                                    }
                                                    onKeyDown={(e) =>
                                                        e.key === 'Enter' &&
                                                        setAbierto(combo)
                                                    }
                                                    className="mt-5 flex cursor-pointer items-center gap-3 rounded-[24px] bg-turquesa p-5 text-white md:hidden"
                                                >
                                                    <ComboContenido
                                                        combo={combo}
                                                        onAgregar={() =>
                                                            agregarRapido(combo)
                                                        }
                                                    />
                                                </section>
                                            )}

                                            {/* Categorías (sticky) */}
                                            <div className="sticky top-0 z-20 -mx-4 mt-5 bg-hueso/95 py-3 backdrop-blur md:top-[76px] md:mx-0 md:mt-8">
                                                <div
                                                    ref={chipsRef}
                                                    className="scrollbar-none flex gap-2 overflow-x-auto px-4 md:px-0"
                                                >
                                                    {categorias.map((c) => (
                                                        <Chip
                                                            key={c.id}
                                                            data-chip={c.id}
                                                            activo={
                                                                categoriaActiva ===
                                                                c.id
                                                            }
                                                            emoji={c.emoji}
                                                            contador={
                                                                productos.filter(
                                                                    (p) =>
                                                                        p.categoria_id ===
                                                                        c.id,
                                                                ).length
                                                            }
                                                            onClick={() =>
                                                                irACategoria(
                                                                    c.id,
                                                                )
                                                            }
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
                                                        seccionesRef.current[
                                                            c.id
                                                        ] = el;
                                                    }}
                                                    className="mt-4 md:mt-8"
                                                >
                                                    <h2 className="mb-1 font-display text-[26px] font-extrabold tracking-[-0.03em] md:mb-4 md:text-[32px]">
                                                        {c.nombre}
                                                    </h2>
                                                    {filas(
                                                        productos.filter(
                                                            (p) =>
                                                                p.categoria_id ===
                                                                c.id,
                                                        ),
                                                    )}
                                                </section>
                                            ))}
                                        </>
                                    )}
                                </main>

                                {/* Escritorio: resumen del pedido siempre visible */}
                                <aside className="hidden lg:block">
                                    <div className="sticky top-[100px]">
                                        <ResumenLateral
                                            lineas={lineas}
                                            productos={productos}
                                            reglas={reglas}
                                            subtotal={subtotal}
                                            unidades={unidades}
                                            onCantidad={cambiarCantidad}
                                            onContinuar={() =>
                                                setVista('carrito')
                                            }
                                        />
                                    </div>
                                </aside>
                            </div>

                            <footer className="mt-14 flex flex-col items-center gap-2 text-center">
                                <Logo className="w-20 opacity-90" />
                                <p className="text-meta text-tinta/45">
                                    {negocio.nombre}
                                </p>
                                {sede.direccion && (
                                    <p className="text-xs text-tinta/50">
                                        {sede.direccion}
                                    </p>
                                )}
                                {(sede.whatsapp_url || sede.maps_url) && (
                                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                                        {sede.whatsapp_url && (
                                            <a
                                                href={sede.whatsapp_url}
                                                target="_blank"
                                                rel="noopener"
                                                className="flex h-10 items-center gap-2 rounded-full bg-tinta px-4 font-display text-[13px] font-bold text-hueso"
                                            >
                                                <IconoWhatsapp className="size-4" />{' '}
                                                Escríbenos
                                            </a>
                                        )}
                                        {sede.maps_url && (
                                            <a
                                                href={sede.maps_url}
                                                target="_blank"
                                                rel="noopener"
                                                className="flex h-10 items-center gap-2 rounded-full border-[1.5px] border-tinta px-4 font-display text-[13px] font-bold"
                                            >
                                                <MapPin className="size-4" />{' '}
                                                Cómo llegar
                                            </a>
                                        )}
                                    </div>
                                )}
                                <RedesSociales
                                    redes={negocio.redes}
                                    className="mt-4"
                                />
                                <Link
                                    href="/links"
                                    className="mt-1 text-meta text-tinta/50 hover:text-rosa"
                                >
                                    Todas las sedes y enlaces
                                </Link>
                                <Credito className="mt-5" />
                            </footer>
                        </div>

                        {/* Web / Barra pedido — móvil y tablet */}
                        {unidades > 0 && (
                            <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[560px] px-4 pb-[max(16px,env(safe-area-inset-bottom))] lg:hidden">
                                <button
                                    type="button"
                                    onClick={() => setVista('carrito')}
                                    className="flex h-[62px] w-full animate-in items-center justify-between rounded-[22px] bg-tinta pr-2 pl-6 text-left text-white shadow-[0_18px_40px_-12px_rgba(11,46,54,0.55)] slide-in-from-bottom-4"
                                >
                                    <span className="flex flex-col">
                                        <span className="text-meta text-white/65">
                                            {unidades}{' '}
                                            {unidades === 1
                                                ? 'producto'
                                                : 'productos'}
                                        </span>
                                        <span className="font-display text-xl leading-none font-bold tracking-[-0.02em] tabular-nums">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </span>
                                    <span className="flex h-[46px] items-center gap-2 rounded-full bg-rosa px-5 font-display text-[15px] font-bold">
                                        Ver pedido{' '}
                                        <ArrowRight
                                            className="size-4"
                                            strokeWidth={3}
                                        />
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {fichas}
        </>
    );
}

function ComboContenido({
    combo,
    onAgregar,
}: {
    combo: MenuProducto;
    onAgregar: () => void;
}) {
    return (
        <>
            <div className="min-w-0 flex-1">
                <p className="text-meta text-white/85">
                    Combo
                    {combo.precio_anterior &&
                    combo.precio_anterior > combo.precio
                        ? ` · ahorra ${formatPrice(combo.precio_anterior - combo.precio)}`
                        : ''}
                </p>
                <p className="mt-1.5 font-display text-[22px] leading-[1.05] font-bold tracking-[-0.02em] md:text-[26px]">
                    {combo.nombre}
                </p>
                {combo.descripcion && (
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-white/90">
                        {combo.descripcion}
                    </p>
                )}
                <p className="mt-1.5 font-display text-lg font-bold">
                    {formatPrice(combo.precio)}
                    {combo.precio_anterior ? (
                        <span className="ml-2 font-sans text-sm font-medium text-white/70 line-through">
                            {formatPrice(combo.precio_anterior)}
                        </span>
                    ) : null}
                </p>
            </div>
            <ProductoFoto
                src={combo.imagen_url}
                color="blanco"
                className="size-[68px] shrink-0 rounded-full md:size-[92px]"
            />
            <Stepper cantidad={0} onMas={onAgregar} />
        </>
    );
}

function ResumenLateral({
    lineas,
    productos,
    reglas,
    subtotal,
    unidades,
    onCantidad,
    onContinuar,
}: {
    lineas: LineaCarrito[];
    productos: MenuProducto[];
    reglas: MenuReglas;
    subtotal: number;
    unidades: number;
    onCantidad: (key: string, cantidad: number) => void;
    onContinuar: () => void;
}) {
    if (!lineas.length) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-[28px] border border-dashed border-tinta/15 px-6 py-10 text-center">
                <span className="text-4xl">🍦</span>
                <p className="font-display text-lg font-bold tracking-[-0.02em]">
                    Tu pedido está vacío
                </p>
                <p className="text-sm text-tinta/60">
                    Toca el + de cualquier producto para empezar.
                </p>
            </div>
        );
    }

    return (
        <div className="flex max-h-[calc(100svh-130px)] flex-col rounded-[28px] border border-tinta/8 bg-white p-5">
            <p className="font-display text-[26px] leading-none font-extrabold tracking-[-0.04em]">
                Tu{' '}
                <span className="font-serif font-normal tracking-normal text-rosa italic">
                    pedido.
                </span>
            </p>
            {reglas.meta_regalo && (
                <div className="mt-4">
                    <MetaRegalo subtotal={subtotal} meta={reglas.meta_regalo} />
                </div>
            )}
            <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
                {lineas.map((l) => {
                    const p = productos.find((x) => x.id === l.producto_id);
                    return (
                        <div
                            key={l.key}
                            className="flex items-center gap-3 border-b border-tinta/8 py-3"
                        >
                            <ProductoFoto
                                src={p?.imagen_url}
                                color={p?.color}
                                className="size-12 shrink-0 rounded-[12px]"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-display text-[15px] font-bold tracking-[-0.02em]">
                                    {l.nombre}
                                </p>
                                {l.detalle && (
                                    <p className="truncate text-xs text-tinta/55">
                                        {l.detalle}
                                    </p>
                                )}
                                <p className="font-display text-sm font-bold">
                                    {formatPrice(
                                        l.precio_unitario * l.cantidad,
                                    )}
                                </p>
                            </div>
                            <Stepper
                                tamano="sm"
                                cantidad={l.cantidad}
                                onMas={() => onCantidad(l.key, l.cantidad + 1)}
                                onMenos={() =>
                                    onCantidad(l.key, l.cantidad - 1)
                                }
                            />
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex items-center justify-between text-[15px] font-medium text-tinta/75">
                <span>
                    Subtotal · {unidades}{' '}
                    {unidades === 1 ? 'producto' : 'productos'}
                </span>
                <span className="font-display text-lg font-bold text-tinta tabular-nums">
                    {formatPrice(subtotal)}
                </span>
            </div>
            <Cta
                className="mt-4"
                accion="Ver pedido"
                total={formatPrice(subtotal)}
                onClick={onContinuar}
            />
        </div>
    );
}
