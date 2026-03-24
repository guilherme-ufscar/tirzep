'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { LocalityProvider } from '@/contexts/LocalityContext';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/contexts/ToastContext';
import Header from '@/components/Header';
import LocalityBar from '@/components/LocalityBar';
import Footer from '@/components/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');

    if (isAdmin) {
        return (
            <ToastProvider>
                {children}
            </ToastProvider>
        );
    }

    return (
        <LocalityProvider>
            <CartProvider>
                <ToastProvider>
                    <Header />
                    <LocalityBar />
                    <main>{children}</main>
                    <Footer />
                </ToastProvider>
            </CartProvider>
        </LocalityProvider>
    );
}
