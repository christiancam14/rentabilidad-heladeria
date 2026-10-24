import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

import { Logo } from '@/components/brand/logo';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-hueso p-6 text-tinta md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8 rounded-[28px] border border-tinta/8 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(11,46,54,0.25)]">
                    <div className="flex flex-col items-center gap-4">
                        <Link href="/" className="flex flex-col items-center gap-2">
                            <Logo className="w-[120px]" />
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <p className="text-meta text-tinta/50">Panel admin</p>
                            <h1 className="font-display text-[26px] leading-tight font-extrabold tracking-[-0.03em]">{title}</h1>
                            <p className="text-center text-sm text-tinta/60">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
