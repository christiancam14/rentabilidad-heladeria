import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

import { Logo } from '@/components/brand/logo';
import { Toggle } from '@/components/brand/toggle';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';

interface ItemMenu {
    titulo: string;
    href: string;
    icono: string;
    contador?: number;
    /** Rutas adicionales que también marcan el ítem como activo */
    tambien?: string[];
}

function useSecciones(): { titulo?: string; items: ItemMenu[] }[] {
    const { admin } = usePage<SharedData>().props;

    return [
        {
            items: [
                { titulo: 'Resumen', href: '/dashboard', icono: '📊' },
                { titulo: 'Pedidos', href: '/admin/pedidos', icono: '🧾', contador: admin?.pedidos_nuevos },
                { titulo: 'Productos', href: '/admin/productos', icono: '🍨' },
                { titulo: 'Categorías', href: '/admin/categorias', icono: '🗂️' },
                { titulo: 'Sabores y adicionales', href: '/admin/opciones', icono: '🍓' },
                { titulo: 'Promociones', href: '/admin/promociones', icono: '🎟️' },
            ],
        },
        {
            titulo: 'Rentabilidad',
            items: [
                { titulo: 'Costeo y recetas', href: '/productos', icono: '🧪' },
                { titulo: 'Insumos', href: '/insumos', icono: '📦' },
                { titulo: 'Cierres de mes', href: '/cierres-mes', icono: '📅' },
                { titulo: 'Finanzas', href: '/finanzas/consolidado', icono: '💰', tambien: ['/finanzas'] },
            ],
        },
        {
            items: [{ titulo: 'Configuración', href: '/admin/configuracion', icono: '⚙️', tambien: ['/settings'] }],
        },
    ];
}

function estaActivo(url: string, item: ItemMenu): boolean {
    const path = url.split('?')[0];
    return [item.href, ...(item.tambien ?? [])].some((h) => path === h || path.startsWith(`${h}/`));
}

/** Admin / Sidebar según el sistema de marca 2026. */
export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
    const { url } = usePage();
    const secciones = useSecciones();

    return (
        <div className="flex h-full flex-col gap-1.5 px-4 pt-7 pb-5">
            <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 pb-6 pl-2">
                <Logo className="w-[52px]" />
                <div className="leading-none">
                    <p className="font-display text-lg font-bold tracking-[-0.02em] text-tinta">A Tu Gusto</p>
                    <p className="mt-1 text-[10px] font-semibold tracking-[0.12em] text-tinta/50 uppercase">Panel admin</p>
                </div>
            </Link>

            <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
                {secciones.map((seccion, i) => (
                    <div key={i} className={cn('flex flex-col gap-1', i > 0 && 'mt-4')}>
                        {seccion.titulo && <p className="text-meta mb-1 px-3.5 text-[10px] text-tinta/40">{seccion.titulo}</p>}
                        {seccion.items.map((item) => {
                            const activo = estaActivo(url, item);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch
                                    onClick={onNavigate}
                                    className={cn(
                                        'flex h-11 items-center gap-3 rounded-[14px] pr-3 pl-3.5 transition-colors',
                                        activo ? 'bg-tinta text-hueso' : 'text-tinta hover:bg-tinta/5',
                                    )}
                                >
                                    <span className="text-base leading-none">{item.icono}</span>
                                    <span className="font-display flex-1 truncate text-[15px] font-bold tracking-[-0.01em]">
                                        {item.titulo}
                                    </span>
                                    {!!item.contador && (
                                        <span
                                            className={cn(
                                                'text-meta min-w-5 rounded-full px-1.5 py-0.5 text-center',
                                                activo ? 'text-hueso' : 'text-rosa',
                                            )}
                                        >
                                            {item.contador}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <SedeActivaCard />
        </div>
    );
}

function SedeActivaCard() {
    const { admin } = usePage<SharedData>().props;
    const sede = admin?.sede_activa;

    if (!sede) return null;

    return (
        <div className="mt-4 flex flex-col gap-2.5 rounded-[18px] bg-turquesa-suave p-4">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-tinta/60 uppercase">Sede activa</p>
                    <div className="relative">
                        <select
                            aria-label="Cambiar sede activa"
                            value={sede.id}
                            onChange={(e) =>
                                router.post('/admin/sede-activa', { sede_id: Number(e.target.value) }, { preserveScroll: true })
                            }
                            className="font-display w-full cursor-pointer appearance-none truncate bg-transparent pr-4 text-[15px] font-bold text-tinta outline-none"
                        >
                            {admin.sedes.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-0 size-3.5 -translate-y-1/2" strokeWidth={2.5} />
                    </div>
                </div>
                <Toggle
                    checked={sede.recibiendo_pedidos}
                    label="Recibir pedidos"
                    onChange={(v) =>
                        router.post(
                            '/admin/sede-activa/recibiendo',
                            { sede_id: sede.id, recibiendo_pedidos: v },
                            { preserveScroll: true },
                        )
                    }
                />
            </div>
            <p className="text-xs font-medium text-tinta/70">
                {sede.recibiendo_pedidos ? 'Recibiendo pedidos' : 'Pedidos en pausa'}
            </p>
        </div>
    );
}
