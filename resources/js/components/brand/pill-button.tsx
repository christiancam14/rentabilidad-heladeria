import { Link } from '@inertiajs/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowRight } from 'lucide-react';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const pill = cva(
    'font-display inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-[-0.01em] whitespace-nowrap transition-[transform,background-color,opacity] select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-turquesa focus-visible:ring-offset-2 focus-visible:outline-none',
    {
        variants: {
            variante: {
                rosa: 'bg-rosa text-white hover:bg-[#f2456f]',
                tinta: 'bg-tinta text-hueso hover:bg-[#123a44]',
                turquesa: 'bg-turquesa text-white hover:bg-[#00b3c5]',
                contorno:
                    'border-[1.5px] border-tinta text-tinta hover:bg-tinta/5',
                suave: 'border border-tinta/15 bg-white text-tinta hover:bg-tinta/5',
                fantasma: 'text-tinta/70 hover:bg-tinta/5 hover:text-tinta',
            },
            tamano: {
                sm: 'h-8 px-3.5 text-[13px]',
                md: 'h-10 px-4 text-sm',
                lg: 'h-[52px] px-7 text-[17px]',
            },
        },
        defaultVariants: { variante: 'rosa', tamano: 'md' },
    },
);

type PillProps = VariantProps<typeof pill> & { flecha?: boolean };

export function PillButton({
    variante,
    tamano,
    flecha,
    className,
    children,
    ...props
}: ComponentProps<'button'> & PillProps) {
    return (
        <button
            className={cn(pill({ variante, tamano }), className)}
            {...props}
        >
            {children}
            {flecha && <ArrowRight className="size-[18px]" strokeWidth={2.5} />}
        </button>
    );
}

export function PillLink({
    variante,
    tamano,
    flecha,
    className,
    children,
    ...props
}: ComponentProps<typeof Link> & PillProps) {
    return (
        <Link className={cn(pill({ variante, tamano }), className)} {...props}>
            {children}
            {flecha && <ArrowRight className="size-[18px]" strokeWidth={2.5} />}
        </Link>
    );
}

export { pill as pillVariants };
