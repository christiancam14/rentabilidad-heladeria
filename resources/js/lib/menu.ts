import { type LineaCarrito, type MenuProducto } from '@/types/menu';

export const ETIQUETAS: Record<string, { texto: string; clase: string }> = {
    mas_pedido: { texto: '🔥 Más pedido', clase: 'bg-rosa text-white' },
    nuevo: { texto: 'Nuevo', clase: 'bg-amarillo text-tinta' },
    combo: { texto: 'Combo', clase: 'bg-white/25 text-white' },
    para_compartir: { texto: '👯 Para compartir', clase: 'bg-turquesa text-white' },
};

/** Un producto requiere abrir la ficha si tiene tamaños o grupos de opciones. */
export function requiereFicha(p: MenuProducto): boolean {
    return p.tamanos.length > 0 || p.grupos.length > 0;
}

export function tamanoPorDefecto(p: MenuProducto): number | null {
    if (!p.tamanos.length) return null;
    return (p.tamanos.find((t) => t.ajuste === 0) ?? p.tamanos[0]).id;
}

/** Precio unitario y descripción de una combinación (espejo de MenuCatalogo::cotizarLinea). */
export function cotizar(p: MenuProducto, tamanoId: number | null, opciones: number[]) {
    let precio = p.precio;
    const detalle: string[] = [];

    const tamano = p.tamanos.find((t) => t.id === tamanoId);
    if (tamano) {
        precio += tamano.ajuste;
        detalle.push(tamano.nombre);
    }

    for (const g of p.grupos) {
        const elegidas = g.opciones.filter((o) => opciones.includes(o.id));
        if (!elegidas.length) continue;
        if (g.tipo === 'adicional') {
            precio += elegidas.reduce((s, o) => s + o.precio, 0);
            detalle.push(elegidas.map((o) => `+ ${o.nombre}`).join(', '));
        } else {
            detalle.push(elegidas.map((o) => o.nombre).join(', '));
        }
    }

    return { precio: Math.max(0, precio), detalle: detalle.length ? detalle.join(' · ') : null };
}

export function claveLinea(productoId: number, tamanoId: number | null, opciones: number[]): string {
    return [productoId, tamanoId ?? 0, [...opciones].sort((a, b) => a - b).join('-')].join(':');
}

/** Revalida el carrito guardado contra el catálogo vigente (precios y disponibilidad). */
export function reconciliarCarrito(lineas: LineaCarrito[], productos: MenuProducto[]): LineaCarrito[] {
    return lineas.flatMap((l) => {
        const p = productos.find((x) => x.id === l.producto_id);
        if (!p || p.agotado) return [];
        if (p.tamanos.length && !p.tamanos.some((t) => t.id === l.tamano_id)) return [];
        const validas = new Set(p.grupos.flatMap((g) => g.opciones.map((o) => o.id)));
        if (l.opciones.some((id) => !validas.has(id))) return [];
        const { precio, detalle } = cotizar(p, l.tamano_id, l.opciones);
        return [{ ...l, nombre: p.nombre, precio_unitario: precio, detalle }];
    });
}

export function leerLocal<T>(clave: string, porDefecto: T): T {
    try {
        const v = window.localStorage.getItem(clave);
        return v ? (JSON.parse(v) as T) : porDefecto;
    } catch {
        return porDefecto;
    }
}

export function guardarLocal(clave: string, valor: unknown): void {
    try {
        window.localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
        // almacenamiento no disponible (modo privado): el carrito vive solo en memoria
    }
}
