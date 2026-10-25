import { cn } from '@/lib/utils';

interface ToggleProps {
    checked: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

/** Admin / Toggle: interruptor turquesa de 44×26. */
export function Toggle({
    checked,
    onChange,
    disabled,
    label,
    className,
}: ToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={cn(
                'relative inline-flex h-[26px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-turquesa focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'bg-turquesa' : 'bg-tinta/15',
                className,
            )}
        >
            <span
                className={cn(
                    'inline-block size-[20px] rounded-full bg-white shadow-sm transition-transform',
                    checked ? 'translate-x-[21px]' : 'translate-x-[3px]',
                )}
            />
        </button>
    );
}
