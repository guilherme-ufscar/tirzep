'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Download, MapPin, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Stats {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    pendingOrders: number;
    ordersByStatus: { status: string; _count: number }[];
    ordersByLocality: { locality: string; _count: number }[];
    lowStockProducts: { id: string; name: string; stock: number; category: { name: string } }[];
    dailySales: { date: string; total: number; count: number }[];
    productsStock: { name: string; stock: number; category: { name: string } }[];
}

const STATUS_LABELS: Record<string, string> = {
    novo: 'Novo',
    reserva_criada: 'Reserva Criada',
    pagamento_aprovado: 'Pagamento Aprovado',
    em_contato: 'Em Contato',
    confirmado: 'Confirmado',
    em_separacao: 'Em Separação',
    saiu_entrega: 'Saiu p/ Entrega',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
};

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const getToken = () => localStorage.getItem('admin_token') || '';
    const getUser = () => {
        try { return JSON.parse(localStorage.getItem('admin_user') || '{}'); } catch { return {}; }
    };

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.status === 401) { router.push('/admin'); return; }
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            } else {
                console.error('Erro ao buscar stats:', data);
            }
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    }, [router]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleExport = async (type: string) => {
        const res = await fetch(`/api/admin/export?type=${type}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/admin');
    };

    const user = getUser();

    if (loading) return <div className="page-loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main */}
            <div className="admin-main">
                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none', marginBottom: '1rem' }}>
                    <span></span><span></span><span></span>
                </button>

                <div className="admin-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '.875rem' }}>Olá, {user.name || 'Admin'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleExport('orders')}><Download size={14} /> Exportar Pedidos</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleExport('products')}><Download size={14} /> Exportar Produtos</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleExport('sales')}><Download size={14} /> Exportar Vendas</button>
                    </div>
                </div>

                {stats && (
                    <>
                        {/* Stats Cards */}
                        <div className="admin-stats">
                            <div className="stat-card">
                                <div className="stat-card-label">Total de Pedidos</div>
                                <div className="stat-card-value">{stats.totalOrders}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-label">Vendas Brutas</div>
                                <div className="stat-card-value">R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-label">Produtos Ativos</div>
                                <div className="stat-card-value">{stats.totalProducts}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-label">Pedidos Pendentes</div>
                                <div className="stat-card-value" style={{ color: stats.pendingOrders > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                    {stats.pendingOrders}
                                </div>
                            </div>
                        </div>

                        <div className="chart-grid">
                            {/* Orders by Status */}
                            <div className="chart-card">
                                <h3>Pedidos por Status</h3>
                                {stats.ordersByStatus.map(s => (
                                    <div key={s.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <span className={`badge status-${s.status}`}>{STATUS_LABELS[s.status] || s.status}</span>
                                        <span style={{ fontWeight: 700 }}>{s._count}</span>
                                    </div>
                                ))}
                                {stats.ordersByStatus.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '.875rem' }}>Nenhum pedido ainda</p>}
                            </div>

                            {/* Orders by Locality */}
                            <div className="chart-card">
                                <h3>Pedidos por Localidade</h3>
                                {stats.ordersByLocality.map(l => (
                                    <div key={l.locality} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 0', borderBottom: '1px solid var(--border)' }}>
                                        <span className={`badge ${l.locality === 'bh' ? 'badge-green' : 'badge-info'}`}>
                                            {l.locality === 'bh' ? 'BH e Região' : 'Fora de BH'}
                                        </span>
                                        <span style={{ fontWeight: 700 }}>{l._count}</span>
                                    </div>
                                ))}
                                {stats.ordersByLocality.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '.875rem' }}>Nenhum pedido ainda</p>}
                            </div>
                        </div>

                        {/* Sales Chart */}
                        <div className="chart-card">
                            <h3>Vendas dos Últimos 30 Dias</h3>
                            {stats.dailySales.length > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px', padding: '1rem 0' }}>
                                    {stats.dailySales.map((d, i) => {
                                        const maxVal = Math.max(...stats.dailySales.map(s => s.total), 1);
                                        const height = (d.total / maxVal) * 160;
                                        return (
                                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ fontSize: '.625rem', color: 'var(--text-secondary)' }}>
                                                    R${d.total.toFixed(0)}
                                                </span>
                                                <div style={{
                                                    width: '100%', height: `${Math.max(height, 4)}px`,
                                                    background: 'linear-gradient(180deg, var(--primary), var(--primary-hover))',
                                                    borderRadius: '4px 4px 0 0',
                                                    transition: 'height .3s ease',
                                                }} title={`${d.date}: R$ ${d.total.toFixed(2)} (${d.count} pedidos)`} />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '.875rem' }}>Nenhuma venda nos últimos 30 dias</p>
                            )}
                        </div>

                        {/* Low Stock Alert */}
                        <div className="chart-card">
                            <h3><AlertTriangle size={18} /> Alertas de Estoque Baixo</h3>
                            {stats.lowStockProducts.length > 0 ? (
                                <div className="admin-table-wrap" style={{ border: '1px solid var(--warning)' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Produto</th>
                                                <th>Categoria</th>
                                                <th>Estoque</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.lowStockProducts.map(p => (
                                                <tr key={p.id}>
                                                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                                                    <td>{p.category.name}</td>
                                                    <td>
                                                        <span className={`badge ${p.stock <= 0 ? 'badge-error' : 'badge-warning'}`}>
                                                            {p.stock} un.
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--success)', fontSize: '.875rem' }}><CheckCircle2 size={14} /> Todos os produtos com estoque adequado</p>
                            )}
                        </div>

                        {/* Products Stock */}
                        <div className="chart-card">
                            <h3>Estoque de Produtos</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                {stats.productsStock.map((p, i) => {
                                    const maxStock = Math.max(...stats.productsStock.map(s => s.stock), 1);
                                    const width = (p.stock / maxStock) * 100;
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                            <span style={{ fontSize: '.8125rem', width: '200px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.name}
                                            </span>
                                            <div style={{ flex: 1, height: '24px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${width}%`, height: '100%',
                                                    background: p.stock <= 5 ? 'var(--error)' : p.stock <= 15 ? 'var(--warning)' : 'var(--primary)',
                                                    borderRadius: '4px',
                                                    transition: 'width .5s ease',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '.5rem',
                                                    fontSize: '.6875rem', color: '#fff', fontWeight: 600,
                                                }}>
                                                    {p.stock}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
