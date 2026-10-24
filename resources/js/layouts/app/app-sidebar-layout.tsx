import { Link, router, usePage } from '@inertiajs/react';
import { Menu, Search } from 'lucide-react';
import { type FormEvent, type PropsWithChildren, useEffect, useState } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { Logo } from '@/components/brand/logo';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem, type SharedData } from '@/types';

/**
 * Shell del panel administrativo (Figma 10 · Panel administrativo):
 * sidebar blanca fija + barra superior con buscador, menú en vivo y usuario.
 */
export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { auth, admin } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const [menuMovil, setMenuMovil] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    // Refresca el contador de pedidos nuevos mientras el panel está abierto
    useEffect(() => {
        const id = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['admin'] });
            }
        }, 30000);
        return () => window.clearInterval(id);
    }, []);

    const buscar = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/productos', busqueda.trim() ? { buscar: busqueda.trim() } : {});
    };

    return (
        <div className="min-h-svh bg-hueso text-tinta">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-tinta/8 bg-white lg:block">
                <AppSidebar />
            </aside>

            <Sheet open={menuMovil} onOpenChange={setMenuMovil}>
                <SheetContent side="left" className="w-[280px] bg-white p-0">
                    <SheetTitle className="sr-only">Menú</SheetTitle>
                    <AppSidebar onNavigate={() => setMenuMovil(false)} />
                </SheetContent>
            </Sheet>

            <div className="lg:pl-[260px]">
                <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 bg-hueso/90 px-4 backdrop-blur md:px-10">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMenuMovil(true)}
                            className="grid size-10 place-items-center rounded-full border border-tinta/10 bg-white lg:hidden"
                            aria-label="Abrir menú"
                        >
                            <Menu className="size-5" />
                        </button>
                        <Link href="/dashboard" className="lg:hidden">
                            <Logo className="w-10" />
                        </Link>
                        <form
                            onSubmit={buscar}
                            className="hidden h-11 w-full max-w-[420px] items-center gap-2 rounded-full border border-tinta/10 bg-white px-[18px] md:flex"
                        >
                            <Search className="size-4 text-tinta/45" />
                            <input
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar productos…"
                                className="h-full flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-tinta/50"
                            />
                        </form>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 md:gap-4">
                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            className="font-display hidden rounded-full border border-tinta/15 px-4 py-2.5 text-[13px] font-bold tracking-[-0.01em] hover:bg-tinta/5 sm:inline-flex"
                        >
                            Ver menú en vivo ↗
                        </a>
                        <Link
                            href="/admin/pedidos"
                            className="relative grid size-10 place-items-center rounded-full text-lg hover:bg-tinta/5"
                            aria-label="Pedidos nuevos"
                        >
                            🔔
                            {!!admin?.pedidos_nuevos && (
                                <span className="absolute top-0.5 right-0.5 grid size-[18px] place-items-center rounded-full bg-rosa text-[10px] font-bold text-white">
                                    {admin.pedidos_nuevos}
                                </span>
                            )}
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="font-display grid size-10 place-items-center rounded-full bg-amarillo text-sm font-bold text-tinta"
                                    aria-label="Cuenta"
                                >
                                    {getInitials(auth.user.name)}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 rounded-xl" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="mx-auto flex w-full max-w-[1260px] flex-col gap-6 px-4 pt-4 pb-16 md:px-10 md:pt-6">
                    {breadcrumbs.length > 1 && (
                        <nav className="text-meta -mb-3 flex flex-wrap gap-1.5 text-tinta/50">
                            {breadcrumbs.map((b, i) => (
                                <span key={i} className="flex gap-1.5">
                                    {i > 0 && <span>/</span>}
                                    {i < breadcrumbs.length - 1 ? (
                                        <Link href={b.href} className="hover:text-tinta">
                                            {b.title}
                                        </Link>
                                    ) : (
                                        <span>{b.title}</span>
                                    )}
                                </span>
                            ))}
                        </nav>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
