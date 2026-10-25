import { ChevronDown } from 'lucide-react';
import { type ComponentProps, type ReactNode, useId } from 'react';

import { cn } from '@/lib/utils';

interface CampoProps extends Omit<ComponentProps<'input'>, 'prefix'> {
    etiqueta?: string;
    sufijo?: ReactNode;
    error?: string;
    ayuda?: string;
    contador?: boolean;
}

/** Admin / Campo: etiqueta en negrita + caja blanca con sufijo (COP, min, contador). */
export function Campo({
    etiqueta,
    sufijo,
    error,
    ayuda,
    contador,
    className,
    id,
    maxLength,
    value,
    ...props
}: CampoProps) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const largo = typeof value === 'string' ? value.length : 0;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {etiqueta && (
                <label
                    htmlFor={inputId}
                    className="font-display text-[13px] font-bold text-tinta"
                >
                    {etiqueta}
                </label>
            )}
            <div
                className={cn(
                    'flex h-[50px] items-center gap-2 rounded-[14px] border bg-white px-4 transition-colors focus-within:border-2 focus-within:border-turquesa focus-within:px-[15px]',
                    error
                        ? 'border-2 border-rosa px-[15px]'
                        : 'border-tinta/15',
                )}
            >
                <input
                    id={inputId}
                    value={value}
                    maxLength={maxLength}
                    aria-invalid={!!error}
                    className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-tinta outline-none placeholder:text-tinta/35"
                    {...props}
                />
                {contador && maxLength ? (
                    <span className="text-[13px] text-tinta/50 tabular-nums">
                        {largo}/{maxLength}
                    </span>
                ) : null}
                {sufijo && (
                    <span className="text-[13px] font-medium text-tinta/50">
                        {sufijo}
                    </span>
                )}
            </div>
            {error ? (
                <p className="text-xs font-medium text-rosa">{error}</p>
            ) : ayuda ? (
                <p className="text-xs text-tinta/55">{ayuda}</p>
            ) : null}
        </div>
    );
}

interface AreaProps extends ComponentProps<'textarea'> {
    etiqueta?: string;
    error?: string;
}

export function CampoArea({
    etiqueta,
    error,
    className,
    id,
    maxLength,
    value,
    ...props
}: AreaProps) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const largo = typeof value === 'string' ? value.length : 0;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {etiqueta && (
                <label
                    htmlFor={inputId}
                    className="font-display text-[13px] font-bold text-tinta"
                >
                    {etiqueta}
                </label>
            )}
            <div
                className={cn(
                    'flex items-end gap-2 rounded-[14px] border bg-white px-4 py-3 focus-within:border-2 focus-within:border-turquesa focus-within:px-[15px] focus-within:py-[11px]',
                    error ? 'border-2 border-rosa' : 'border-tinta/15',
                )}
            >
                <textarea
                    id={inputId}
                    value={value}
                    maxLength={maxLength}
                    rows={2}
                    className="min-w-0 flex-1 resize-none bg-transparent text-[15px] leading-[1.45] font-medium text-tinta outline-none placeholder:text-tinta/35"
                    {...props}
                />
                {maxLength ? (
                    <span className="pb-0.5 text-[13px] text-tinta/50 tabular-nums">
                        {largo}/{maxLength}
                    </span>
                ) : null}
            </div>
            {error && <p className="text-xs font-medium text-rosa">{error}</p>}
        </div>
    );
}

interface SelectorProps extends ComponentProps<'select'> {
    etiqueta?: string;
    error?: string;
}

export function CampoSelector({
    etiqueta,
    error,
    className,
    id,
    children,
    ...props
}: SelectorProps) {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {etiqueta && (
                <label
                    htmlFor={inputId}
                    className="font-display text-[13px] font-bold text-tinta"
                >
                    {etiqueta}
                </label>
            )}
            <div className="relative">
                <select
                    id={inputId}
                    className={cn(
                        'h-[50px] w-full appearance-none rounded-[14px] border bg-white pr-10 pl-4 text-[15px] font-medium text-tinta outline-none focus:border-2 focus:border-turquesa focus:pl-[15px]',
                        error ? 'border-2 border-rosa' : 'border-tinta/15',
                    )}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-tinta/50" />
            </div>
            {error && <p className="text-xs font-medium text-rosa">{error}</p>}
        </div>
    );
}
