'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { ClipboardList, Eye, MessageCircle, CreditCard, Monitor, MapPin, Package } from 'lucide-react';

interface OrderItem { id: string; name: string; quantity: number; price: number; }
interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    addressStreet: string;
    addressNumber: string;
    addressComplement: string;
    addressNeighborhood: string;
    addressCity: string;
    addressState: string;
    addressZip: string;
    locality: string;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    total: number;
    notes: string;
    createdAt: string;
    items: OrderItem[];
}

const STATUS_LABELS: Record<string, string> = {
    novo: 'Novo',
    reserva_criada: 'Reserva Criada',
    pagamento_aprovado: 'Pagamento Aprovado',
    em_contato: 'Em Contato (WhatsApp)',
    confirmado: 'Confirmado',
    em_separacao: 'Em Separação',
    saiu_entrega: 'Saiu p/ Entrega / Em Transporte',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
};

const ALL_STATUSES = Object.keys(STATUS_LABELS);

export default function AdminPedidosPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterLocality, setFilterLocality] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    const getToken = () => localStorage.getItem('admin_token') || '';

    const fetchOrders = useCallback(async () => {
        const params = new URLSearchParams();
        if (filterStatus) params.set('status', filterStatus);
        if (filterLocality) params.set('locality', filterLocality);
        if (filterDateFrom) params.set('dateFrom', filterDateFrom);
        if (filterDateTo) params.set('dateTo', filterDateTo);

        try {
            const res = await fetch(`/api/admin/orders?${params}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            if (res.status === 401) { router.push('/admin'); return; }
            setOrders(await res.json());
        } catch { } finally { setLoading(false); }
    }, [router, filterStatus, filterLocality, filterDateFrom, filterDateTo]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const updateStatus = async (orderId: string, status: string) => {
        await fetch('/api/admin/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ id: orderId, status }),
        });
        fetchOrders();
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => prev ? { ...prev, status } : null);
        }
    };

    const openWhatsApp = (order: Order) => {
        const msg = encodeURIComponent(
            `Olá ${order.customerName}! Vi sua reserva (${order.orderNumber}) no site TirzepBH.\n\nItens:\n${order.items.map(i => `- ${i.name} x${i.quantity}`).join('\n')}\n\nTotal: R$ ${order.total.toFixed(2).replace('.', ',')}\n\nVamos confirmar a entrega?`
        );
        window.open(`https://wa.me/55${order.customerPhone}?text=${msg}`, '_blank');
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <div className="admin-main">
                <div className="admin-header">
                    <h1>Pedidos</h1>
                </div>

                {/* Filters */}
                <div className="admin-filters">
                    <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">Todos os status</option>
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <select className="form-select" value={filterLocality} onChange={e => setFilterLocality(e.target.value)}>
                        <option value="">Todas localidades</option>
                        <option value="bh">BH e Região</option>
                        <option value="fora">Fora de BH</option>
                    </select>
                    <input type="date" className="form-input" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} placeholder="De" />
                    <input type="date" className="form-input" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} placeholder="Até" />
                </div>

                {loading ? (
                    <div className="page-loading"><div className="spinner"></div></div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><ClipboardList size={40} /></div>
                        <h3>Nenhum pedido encontrado</h3>
                        <p>Ajuste os filtros ou aguarde novos pedidos.</p>
                    </div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Pedido</th>
                                    <th>Cliente</th>
                                    <th>Localidade</th>
                                    <th>Pagamento</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th>Data</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td style={{ fontWeight: 700 }}>{o.orderNumber}</td>
                                        <td>
                                            <div>{o.customerName}</div>
                                            <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>{o.customerPhone}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${o.locality === 'bh' ? 'badge-green' : 'badge-info'}`}>
                                                {o.locality === 'bh' ? 'BH' : 'Fora'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${o.paymentMethod === 'entrega' ? 'badge-green' : 'badge-info'}`}>
                                                {o.paymentMethod === 'entrega' ? 'Na entrega' : 'Online'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge status-${o.status}`}>{STATUS_LABELS[o.status] || o.status}</span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>R$ {o.total.toFixed(2).replace('.', ',')}</td>
                                        <td style={{ fontSize: '.8125rem' }}>{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '.375rem' }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(o)}><Eye size={12} /> Ver</button>
                                                <button className="btn btn-sm" style={{ background: '#25D366', color: '#fff' }} onClick={() => openWhatsApp(o)}><MessageCircle size={12} /> WhatsApp</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Order Detail Modal */}
                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                            <h2>Pedido {selectedOrder.orderNumber}</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <h4 style={{ marginBottom: '.5rem' }}>Cliente</h4>
                                    <p style={{ margin: 0, color: 'var(--text-primary)' }}><strong>{selectedOrder.customerName}</strong></p>
                                    <p style={{ margin: 0 }}>{selectedOrder.customerPhone}</p>
                                    {selectedOrder.customerEmail && <p style={{ margin: 0 }}>{selectedOrder.customerEmail}</p>}
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '.5rem' }}>Endereço</h4>
                                    <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                                        {selectedOrder.addressStreet}, {selectedOrder.addressNumber}
                                        {selectedOrder.addressComplement && ` - ${selectedOrder.addressComplement}`}
                                    </p>
                                    <p style={{ margin: 0 }}>{selectedOrder.addressNeighborhood} - {selectedOrder.addressCity}/{selectedOrder.addressState}</p>
                                    <p style={{ margin: 0 }}>CEP: {selectedOrder.addressZip}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <span className={`badge ${selectedOrder.locality === 'bh' ? 'badge-green' : 'badge-info'}`}>
                                    {selectedOrder.locality === 'bh' ? 'BH e Região' : 'Fora de BH'}
                                </span>
                                <span className={`badge ${selectedOrder.paymentMethod === 'entrega' ? 'badge-green' : 'badge-info'}`}>
                                    {selectedOrder.paymentMethod === 'entrega' ? 'Pagamento na entrega' : 'Pago online'}
                                </span>
                                <span className={`badge status-${selectedOrder.status}`}>
                                    {STATUS_LABELS[selectedOrder.status]}
                                </span>
                            </div>

                            <h4 style={{ marginBottom: '.5rem' }}>Itens</h4>
                            <div style={{ background: 'var(--background)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                                {selectedOrder.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '.375rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <span>{item.name} x{item.quantity}</span>
                                        <span style={{ fontWeight: 600 }}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.75rem 0 0', fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>
                                    <span>Total</span>
                                    <span>R$ {selectedOrder.total.toFixed(2).replace('.', ',')} + frete</span>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '.5rem' }}>Alterar Status</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.375rem', marginBottom: '1rem' }}>
                                {ALL_STATUSES.map(s => (
                                    <button
                                        key={s}
                                        className={`btn btn-sm ${selectedOrder.status === s ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => updateStatus(selectedOrder.id, s)}
                                    >
                                        {STATUS_LABELS[s]}
                                    </button>
                                ))}
                            </div>

                            <button className="btn btn-full" style={{ background: '#25D366', color: '#fff', marginBottom: '.75rem' }} onClick={() => openWhatsApp(selectedOrder)}>
                                <MessageCircle size={16} /> Abrir WhatsApp com mensagem pré-preenchida
                            </button>

                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
