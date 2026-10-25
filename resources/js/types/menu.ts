export interface MenuOpcion {
    id: number;
    nombre: string;
    precio: number;
}

export interface MenuGrupo {
    id: number;
    nombre: string;
    tipo: 'sabor' | 'adicional';
    obligatorio: boolean;
    max: number;
    opciones: MenuOpcion[];
}

export interface MenuTamano {
    id: number;
    nombre: string;
    ajuste: number;
}

export interface MenuProducto {
    id: number;
    categoria_id: number | null;
    nombre: string;
    descripcion: string | null;
    precio: number;
    precio_anterior: number | null;
    imagen_url: string | null;
    color: string;
    etiqueta: 'mas_pedido' | 'nuevo' | 'combo' | 'para_compartir' | null;
    agotado: boolean;
    tamanos: MenuTamano[];
    grupos: MenuGrupo[];
}

export interface MenuCategoria {
    id: number;
    nombre: string;
    slug: string;
    emoji: string | null;
}

export interface MenuSede {
    id: number;
    nombre: string;
    slug: string;
    direccion: string | null;
    tiempo_preparacion: number;
    recibiendo_pedidos: boolean;
    maps_url: string | null;
    whatsapp_url: string | null;
    horarios: { dias: string; abre: string; cierra: string; activo: boolean }[];
}

export type RedSocial = 'instagram' | 'facebook' | 'tiktok';

export interface Negocio {
    nombre: string;
    eslogan: string;
    redes: Partial<Record<RedSocial, string>>;
}

export interface MenuReglas {
    pedido_minimo: number;
    meta_regalo: { desde: number; texto: string } | null;
    sugerencias_producto: boolean;
    sugerencias_carrito: boolean;
    pagos: { key: string; label: string }[];
}

export interface LineaCarrito {
    key: string;
    producto_id: number;
    cantidad: number;
    tamano_id: number | null;
    opciones: number[];
    nombre: string;
    detalle: string | null;
    precio_unitario: number;
}
