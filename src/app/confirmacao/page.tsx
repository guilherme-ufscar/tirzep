'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, MapPin, Package, CreditCard, Monitor, MessageCircle, Store } from 'lucide-react';

interface OrderData {
    orderNumber: string;
    status: string;
    locality: string;
    paymentMethod: string;
    total: number;
    customerName: string;
    customerPhone: string;
}

export default function ConfirmacaoPage() {
    const [order, setOrder] = useState<OrderData | null>(null);

    useEffect(() => {
        const saved = sessionStorage.getItem('tg_last_order');
        if (saved) {
            try { setOrder(JSON.parse(saved)); } catch { }
        }
    }, []);

    if (!order) {
        return (
            <div className="section">
                <div className="container empty-state">
                    <div className="empty-state-icon"><Package size={40} /></div>
                    <h3>Nenhum pedido recente</h3>
                    <p>Faça um pedido para ver a confirmação aqui.</p>
                    <Link href="/loja" className="btn btn-primary">Ir para Loja</Link>
                </div>
            </div>
        );
    }

    const whatsappNumber = '5537991236448';
    const whatsappMessage = encodeURIComponent(
        `Olá! Acabei de fazer uma reserva no site TirzepBH.\n\nPedido: ${order.orderNumber}\nNome: ${order.customerName}\nTelefone: ${order.customerPhone}\nTotal: R$ ${order.total.toFixed(2).replace('.', ',')}\n\nGostaria de combinar a entrega / envio!`
    );

    return (
        <div className="section">
            <div className="container">
                <div className="confirmation">
                    <div className="confirmation-icon"><CheckCircle size={56} color="var(--primary)" /></div>
                    <h1>Reserva Confirmada!</h1>
                    <p style={{ fontSize: '1.125rem' }}>
                        Sua reserva foi criada com sucesso! O pagamento será combinado via WhatsApp.
                    </p>

                    <div className="confirmation-details">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                            <span style={{ fontWeight: 600 }}>Número do Pedido</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{order.orderNumber}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                            <span style={{ fontWeight: 600 }}>Status</span>
                            <span className={`badge status-${order.status}`}>
                                Reserva Criada
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                            <span style={{ fontWeight: 600 }}>Pagamento</span>
                            <span className="badge badge-green">
                                <><CreditCard size={14} /> Offline / A Combinar</>
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600 }}>Total</span>
                            <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                                R$ {order.total.toFixed(2).replace('.', ',')} + frete
                            </span>
                        </div>
                    </div>

                    <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'left' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}><MapPin size={18} /> Próximos passos:</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ padding: '.375rem 0', color: 'var(--text-primary)', fontSize: '.9375rem' }}>
                                1. Entre em contato via WhatsApp para combinar a entrega/frete
                            </li>
                            <li style={{ padding: '.375rem 0', color: 'var(--text-primary)', fontSize: '.9375rem' }}>
                                2. O pagamento será alinhado no WhatsApp (PIX, Entrega, etc)
                            </li>
                            <li style={{ padding: '.375rem 0', color: 'var(--text-primary)', fontSize: '.9375rem' }}>
                                3. Após reservar, garantimos agilidade no seu envio!
                            </li>
                        </ul>
                        <p style={{ fontSize: '.8125rem', color: 'var(--text-secondary)', marginTop: '.75rem' }}>
                            O site contém todas as informações necessárias. O WhatsApp é utilizado apenas para finalizar os detalhes da entrega e pagamento.
                        </p>
                    </div>

                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="confirmation-whatsapp"
                    >
                        <MessageCircle size={18} /> Combinar Entrega no WhatsApp
                    </a>

                    <div style={{ marginTop: '1.5rem' }}>
                        <Link href="/loja" className="btn btn-secondary">
                            <Store size={16} /> Continuar Comprando
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
