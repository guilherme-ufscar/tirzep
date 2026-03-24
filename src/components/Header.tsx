'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Home, Store, GitCompareArrows, Menu, X } from 'lucide-react';

export default function Header() {
    const { totalItems } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="header">
            <div className="header-inner">
                <Link href="/" className="header-logo" style={{ display: 'flex', alignItems: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/files/imagens/logo.webp" alt="TirzepBH Logo" style={{ height: '60px', width: 'auto' }} />
                </Link>

                <nav className={`header-nav ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
                    <Link href="/"><Home size={16} /> Home</Link>
                    <Link href="/loja"><Store size={16} /> Loja</Link>
                    <Link href="/comparativos"><GitCompareArrows size={16} /> Comparativos</Link>
                    <Link href="/carrinho"><ShoppingCart size={16} /> Carrinho</Link>
                </nav>

                <div className="header-actions">
                    <Link href="/carrinho" className="cart-btn">
                        <ShoppingCart size={18} /> Carrinho
                        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                    </Link>
                    <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>
        </header>
    );
}
