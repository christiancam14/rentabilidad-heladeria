import { Link } from '@inertiajs/react';
import { LayoutGrid, Package, IceCream, Calendar } from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';

import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Insumos',
        href: '/insumos',
        icon: Package,
    },
    {
        title: 'Productos',
        href: '/productos',
        icon: IceCream,
    },
    {
        title: 'Cierres de Mes',
        href: '/cierres-mes',
        icon: Calendar,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {footerNavItems.length > 0 && <NavFooter items={footerNavItems} className="mt-auto" />}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
