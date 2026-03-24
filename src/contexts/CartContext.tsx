'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    slug: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, qty: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType>({
    items: [],
    addItem: () => { },
    removeItem: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    totalItems: 0,
    totalPrice: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('tg_cart');
        if (saved) {
            try { setItems(JSON.parse(saved)); } catch { }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('tg_cart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
            }
            return [...prev, { ...item, quantity: qty }];
        });
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, qty: number) => {
        if (qty <= 0) {
            setItems(prev => prev.filter(i => i.id !== id));
            return;
        }
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
