'use client';
import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useLocality } from '@/contexts/LocalityContext';
import { getImageUrl } from '@/lib/imageUrl';
import { ShoppingCart, Truck, MapPin, Package, Trash2 } from 'lucide-react';

export default function CarrinhoPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
    const { locality } = useLocality();

    if (items.length === 0) {
        return (
            <div className="section">
                <div className="container empty-state">
                    <div className="empty-state-icon"><ShoppingCart size={40} /></div>
                    <h3>Seu carrinho está vazio</h3>
                    <p>Adicione produtos à sua sacola para continuar.</p>
                    <Link href="/loja" className="btn btn-primary">Explorar Produtos</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="section">
            <div className="container">
                <h1 style={{ marginBottom: '2rem' }}>Carrinho</h1>

                <div className="cart-layout">
                    <div>
                        {items.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-img">
                                    {item.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={getImageUrl(item.image)} alt={item.name} />
                                    ) : (
                                        <div className="placeholder-img" style={{ width: '100px', height: '100px', fontSize: '1.5rem' }}>
                                            {item.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="cart-item-info">
                                    <Link href={`/produto/${item.slug}`} className="cart-item-name" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                                        {item.name}
                                    </Link>
                                    <div className="cart-item-price">
                                        R$ {item.price.toFixed(2).replace('.', ',')}
                                    </div>
                                    <div className="cart-item-actions">
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                        <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                                            <Trash2 size={14} /> Remover
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h3>Resumo do Pedido</h3>
                        <div className="cart-summary-row">
                            <span>Itens ({totalItems})</span>
                            <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>Frete</span>
                            <span className="frete-badge"><Truck size={14} /> A combinar</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>Total</span>
                            <span>R$ {totalPrice.toFixed(2).replace('.', ',')} + frete</span>
                        </div>

                        <div style={{ margin: '1rem 0', padding: '.75rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
                            {locality === 'bh' ? (
                                <p style={{ fontSize: '.8125rem', color: 'var(--badge-text)', margin: 0, fontWeight: 500 }}>
                                    <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> BH e região: Pagamento somente na entrega
                                </p>
                            ) : (
                                <p style={{ fontSize: '.8125rem', color: '#0369A1', margin: 0, fontWeight: 500, background: '#E0F2FE', padding: '.75rem', borderRadius: 'var(--radius-sm)' }}>
                                    <Package size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Fora de BH: Pagamento online obrigatório
                                </p>
                            )}
                        </div>

                        <Link href="/checkout" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '.5rem' }}>
                            Finalizar Pedido
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
