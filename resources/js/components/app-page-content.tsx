import * as React from 'react';

import { cn } from '@/lib/utils';

interface AppPageContentProps extends React.ComponentProps<'div'> {
    children: React.ReactNode;
}

export function AppPageContent({
    children,
    className,
    ...props
}: AppPageContentProps) {
    return (
        <div
            className={cn(
                'flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
