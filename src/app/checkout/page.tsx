'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useLocality } from '@/contexts/LocalityContext';
import { useToast } from '@/contexts/ToastContext';
import { ShoppingCart, MapPin, Package, Truck } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, totalItems, clearCart } = useCart();
    const { locality } = useLocality();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        addressStreet: '',
        addressNumber: '',
        addressComplement: '',
        addressNeighborhood: '',
        addressCity: locality === 'bh' ? 'Belo Horizonte' : '',
        addressState: locality === 'bh' ? 'MG' : '',
        addressZip: '',
        notes: '',
        paymentMethod: 'entrega',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const validate = () => {
        if (!form.customerName.trim()) newErrors.customerName = 'Nome é obrigatório';
        if (!form.customerPhone.trim()) newErrors.customerPhone = 'Telefone com DDD é obrigatório';
        else {
            const phone = form.customerPhone.replace(/\D/g, '');
            if (phone.length < 10 || phone.length > 11) newErrors.customerPhone = 'Telefone inválido (ex: 31999999999)';
        }
        if (locality === 'bh') {
            if (!form.addressStreet.trim()) newErrors.addressStreet = 'Rua é obrigatória';
            if (!form.addressNumber.trim()) newErrors.addressNumber = 'Número é obrigatório';
            if (!form.addressNeighborhood.trim()) newErrors.addressNeighborhood = 'Bairro é obrigatório';
            if (!form.addressCity.trim()) newErrors.addressCity = 'Cidade é obrigatória';
            if (!form.addressState.trim()) newErrors.addressState = 'Estado é obrigatório';
            if (!form.addressZip.trim()) newErrors.addressZip = 'CEP é obrigatório';
            else {
                const cep = form.addressZip.replace(/\D/g, '');
                if (cep.length !== 8) newErrors.addressZip = 'CEP inválido (8 dígitos)';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (items.length === 0) {
            showToast('Carrinho vazio!', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    locality,
                    items: items.map(i => ({
                        productId: i.id,
                        name: i.name,
                        quantity: i.quantity,
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao criar pedido');

            clearCart();
            // Store order data for confirmation page
            sessionStorage.setItem('tg_last_order', JSON.stringify(data.order));
            
            if (locality !== 'bh') {
                const message = `Olá, gostaria de finalizar a compra do pedido ${data.order.orderNumber}. \n\nTotal: R$ ${data.order.total.toFixed(2).replace('.', ',')}\n\nPor favor, me informe o valor do frete e opções de pagamento para envio.`;
                window.open(`https://wa.me/5531999999999?text=${encodeURIComponent(message)}`, '_blank');
            }
            
            router.push('/confirmacao');
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Erro ao processar pedido', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="section">
                <div className="container empty-state">
                    <div className="empty-state-icon"><ShoppingCart size={40} /></div>
                    <h3>Carrinho vazio</h3>
                    <p>Adicione produtos antes de fazer o checkout.</p>
                    <Link href="/loja" className="btn btn-primary">Ir para Loja</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="section">
            <div className="container">
                <div className="breadcrumbs">
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <Link href="/carrinho">Carrinho</Link>
                    <span>/</span>
                    <span>Checkout</span>
                </div>

                <h1 style={{ marginBottom: '2rem' }}>
                    {locality === 'bh' ? 'Finalizar Reserva' : 'Finalizar Pedido'}
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="checkout-layout">
                        <div>
                            {/* Info Bar */}
                            {locality === 'bh' ? (
                                <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', background: 'var(--primary-light)' }}>
                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--badge-text)', fontSize: '.875rem' }}>
                                        <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Sua compra será uma <strong>RESERVA</strong>. O pagamento é feito somente na entrega. O contato será feito via WhatsApp.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', background: '#fff3cd', color: '#856404' }}>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '.875rem' }}>
                                        <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong>Para fora de BH:</strong> O pagamento não será feito na entrega. Ao finalizar, você falará com um vendedor no WhatsApp para calcular o valor do frete e realizar o pagamento online.
                                    </p>
                                </div>
                            )}

                            {/* Dados Pessoais */}
                            <div className="checkout-section">
                                <h3>Dados Pessoais</h3>
                                <div className="checkout-grid">
                                    <div className="form-group checkout-full">
                                        <label className="form-label">Nome completo *</label>
                                        <input
                                            type="text"
                                            className={`form-input ${errors.customerName ? 'error' : ''}`}
                                            name="customerName"
                                            value={form.customerName}
                                            onChange={handleChange}
                                            placeholder="Seu nome completo"
                                        />
                                        {errors.customerName && <p className="form-error">{errors.customerName}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-input" name="customerEmail" value={form.customerEmail} onChange={handleChange} placeholder="seu@email.com" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">WhatsApp (Telefone com DDD) *</label>
                                        <input
                                            type="tel"
                                            className={`form-input ${errors.customerPhone ? 'error' : ''}`}
                                            name="customerPhone"
                                            value={form.customerPhone}
                                            onChange={handleChange}
                                            placeholder="(31) 99999-9999"
                                        />
                                        {errors.customerPhone && <p className="form-error">{errors.customerPhone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Endereço */}
                            {locality === 'bh' && (
                                <div className="checkout-section">
                                    <h3>Endereço de Entrega / Envio</h3>
                                    <div className="checkout-grid">
                                        <div className="form-group">
                                            <label className="form-label">CEP *</label>
                                            <input
                                                type="text"
                                                className={`form-input ${errors.addressZip ? 'error' : ''}`}
                                                name="addressZip"
                                                value={form.addressZip}
                                                onChange={handleChange}
                                                placeholder="30000-000"
                                            />
                                            {errors.addressZip && <p className="form-error">{errors.addressZip}</p>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Estado *</label>
                                            <input
                                                type="text"
                                                className={`form-input ${errors.addressState ? 'error' : ''}`}
                                                name="addressState"
                                                value={form.addressState}
                                                onChange={handleChange}
                                                placeholder="MG"
                                                maxLength={2}
                                            />
                                            {errors.addressState && <p className="form-error">{errors.addressState}</p>}
                                        </div>
                                        <div className="form-group checkout-full">
                                            <label className="form-label">Rua *</label>
                                            <input
                                                type="text"
                                                className={`form-input ${errors.addressStreet ? 'error' : ''}`}
                                                name="addressStreet"
                                                value={form.addressStreet}
                                                onChange={handleChange}
                                                placeholder="Rua / Avenida"
                                            />
                                            {errors.addressStreet && <p className="form-error">{errors.addressStreet}</p>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Número *</label>
                                            <input
                                                type="text"
                                                className={`form-input ${errors.addressNumber ? 'error' : ''}`}
                                                name="addressNumber"
                                                value={form.addressNumber}
                                                onChange={handleChange}
                                                placeholder="123"
                                            />
                                            {errors.addressNumber && <p className="form-error">{errors.addressNumber}</p>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Complemento</label>
                                            <input type="text" className="form-input" name="addressComplement" value={form.addressComplement} onChange={handleChange} placeholder="Apto, bloco..." />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Bairro *</label>
                                            <input
                                                type="text"
                                                className={`form-input ${errors.addressNeighborhood ? 'error' : ''}`}
                                                name="addressNeighborhood"
                                                value={form.addressNeighborhood}
                                                onChange={handleChange}
                                                placeholder="Bairro"
                                            />
                                            {errors.addressNeighborhood && <p className="form-error">{errors.addressNeighborhood}</p>}
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Cidade *</label>
                                            <input
                                                type="text"
                                                className={`form-input ${errors.addressCity ? 'error' : ''}`}
                                                name="addressCity"
                                                value={form.addressCity}
                                                onChange={handleChange}
                                                placeholder="Cidade"
                                            />
                                            {errors.addressCity && <p className="form-error">{errors.addressCity}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}



                            {/* Observações */}
                            <div className="checkout-section">
                                <h3>Observações</h3>
                                <textarea
                                    className="form-textarea"
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    placeholder="Alguma observação sobre o pedido?"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <div className="cart-summary">
                                <h3>Resumo do Pedido</h3>
                                {items.map(item => (
                                    <div key={item.id} className="cart-summary-row" style={{ fontSize: '.8125rem' }}>
                                        <span>{item.name} (x{item.quantity})</span>
                                        <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ))}
                                <div className="cart-summary-row">
                                    <span>Frete</span>
                                    <span className="frete-badge"><Truck size={14} /> A combinar</span>
                                </div>
                                <div className="cart-summary-row">
                                    <span>Total ({totalItems} itens)</span>
                                    <span>R$ {totalPrice.toFixed(2).replace('.', ',')} + frete</span>
                                </div>

                                <div style={{ margin: '1rem 0', padding: '.75rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
                                    <p style={{ margin: 0, fontSize: '.8125rem', fontWeight: 600, color: 'var(--badge-text)' }}>
                                        {locality === 'bh' 
                                            ? 'Pagamento na entrega — Reserva pelo WhatsApp' 
                                            : 'Pagamento online a combinar via WhatsApp'}
                                    </p>
                                </div>

                                <button type="submit" className={`btn btn-primary btn-full btn-lg ${loading ? 'loading' : ''}`} disabled={loading}>
                                    {loading ? 'Processando...' : (locality === 'bh' ? 'Finalizar Reserva' : 'Falar com vendedor')}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
