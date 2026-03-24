'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { BarChart3, MapPin, DollarSign, Package, Download } from 'lucide-react';

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
    novo: 'Novo', reserva_criada: 'Reserva Criada', pagamento_aprovado: 'Pago',
    em_contato: 'Em Contato', confirmado: 'Confirmado', em_separacao: 'Em Separação',
    saiu_entrega: 'Saiu p/ Entrega', entregue: 'Entregue', cancelado: 'Cancelado',
};

export default function AdminRelatoriosPage() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [exportDateFrom, setExportDateFrom] = useState('');
    const [exportDateTo, setExportDateTo] = useState('');
    const [exportStatus, setExportStatus] = useState('');
    const [exportLocality, setExportLocality] = useState('');

    const getToken = () => localStorage.getItem('admin_token') || '';

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${getToken()}` } });
            if (res.status === 401) { router.push('/admin'); return; }
            setStats(await res.json());
        } catch { } finally { setLoading(false); }
    }, [router]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleExport = async (type: string) => {
        const params = new URLSearchParams({ type });
        if (exportDateFrom) params.set('dateFrom', exportDateFrom);
        if (exportDateTo) params.set('dateTo', exportDateTo);
        if (exportStatus) params.set('status', exportStatus);
        if (exportLocality) params.set('locality', exportLocality);

        const res = await fetch(`/api/admin/export?${params}`, {
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

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <div className="admin-main">
                <div className="admin-header">
                    <h1>Relatórios e Exportação</h1>
                </div>

                {loading ? (
                    <div className="page-loading"><div className="spinner"></div></div>
                ) : stats && (
                    <>
                        {/* Stats overview */}
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
                                <div className="stat-card-value">{stats.pendingOrders}</div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="chart-grid">
                            {/* Orders by Status */}
                            <div className="chart-card">
                                <h3><BarChart3 size={18} /> Pedidos por Status</h3>
                                {stats.ordersByStatus.length > 0 ? (
                                    <div>
                                        {stats.ordersByStatus.map(s => {
                                            const total = stats.ordersByStatus.reduce((a, b) => a + b._count, 0);
                                            const pct = total > 0 ? (s._count / total) * 100 : 0;
                                            return (
                                                <div key={s.status} style={{ marginBottom: '.75rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.25rem' }}>
                                                        <span className={`badge status-${s.status}`}>{STATUS_LABELS[s.status] || s.status}</span>
                                                        <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{s._count}</span>
                                                    </div>
                                                    <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width .5s ease' }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : <p style={{ color: 'var(--text-secondary)' }}>Nenhum dado disponível</p>}
                            </div>

                            {/* Orders by Locality */}
                            <div className="chart-card">
                                <h3><MapPin size={18} /> Pedidos por Localidade</h3>
                                {stats.ordersByLocality.length > 0 ? (
                                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', paddingTop: '1rem' }}>
                                        {stats.ordersByLocality.map(l => {
                                            const total = stats.ordersByLocality.reduce((a, b) => a + b._count, 0);
                                            const pct = total > 0 ? Math.round((l._count / total) * 100) : 0;
                                            return (
                                                <div key={l.locality} style={{ textAlign: 'center' }}>
                                                    <div style={{
                                                        width: '100px', height: '100px', borderRadius: '50%',
                                                        background: `conic-gradient(${l.locality === 'bh' ? 'var(--primary)' : '#0369A1'} ${pct * 3.6}deg, var(--border) 0)`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .75rem',
                                                    }}>
                                                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                                                            {pct}%
                                                        </div>
                                                    </div>
                                                    <span className={`badge ${l.locality === 'bh' ? 'badge-green' : 'badge-info'}`}>
                                                        {l.locality === 'bh' ? 'BH' : 'Fora'}: {l._count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : <p style={{ color: 'var(--text-secondary)' }}>Nenhum dado disponível</p>}
                            </div>
                        </div>

                        {/* Sales Chart */}
                        <div className="chart-card">
                            <h3><DollarSign size={18} /> Vendas Brutas (Últimos 30 Dias)</h3>
                            {stats.dailySales.length > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '200px', padding: '1rem 0' }}>
                                    {stats.dailySales.map((d, i) => {
                                        const maxVal = Math.max(...stats.dailySales.map(s => s.total), 1);
                                        const height = (d.total / maxVal) * 160;
                                        return (
                                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                <span style={{ fontSize: '.5625rem', color: 'var(--text-secondary)', writingMode: 'vertical-rl' }}>
                                                    {d.date.slice(5)}
                                                </span>
                                                <div style={{
                                                    width: '100%', height: `${Math.max(height, 4)}px`,
                                                    background: 'linear-gradient(180deg, var(--primary), var(--primary-hover))',
                                                    borderRadius: '3px 3px 0 0',
                                                }} title={`${d.date}: R$ ${d.total.toFixed(2)} | ${d.count} pedidos`} />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <p style={{ color: 'var(--text-secondary)' }}>Nenhuma venda registrada</p>}
                        </div>

                        {/* Stock */}
                        <div className="chart-card">
                            <h3><Package size={18} /> Estoque de Produtos</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                {stats.productsStock.map((p, i) => {
                                    const maxStock = Math.max(...stats.productsStock.map(s => s.stock), 1);
                                    const width = (p.stock / maxStock) * 100;
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                            <span style={{ fontSize: '.8125rem', width: '180px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.name}
                                            </span>
                                            <div style={{ flex: 1, height: '24px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${width}%`, height: '100%',
                                                    background: p.stock <= 5 ? 'var(--error)' : p.stock <= 15 ? 'var(--warning)' : 'var(--primary)',
                                                    borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                                    paddingRight: '.5rem', fontSize: '.6875rem', color: '#fff', fontWeight: 600,
                                                }}>
                                                    {p.stock}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{p.category.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Export Section */}
                        <div className="chart-card">
                            <h3><Download size={18} /> Exportação CSV</h3>
                            <p style={{ marginBottom: '1rem', fontSize: '.875rem' }}>Aplique filtros e exporte dados em CSV.</p>

                            <div className="admin-filters" style={{ marginBottom: '1rem' }}>
                                <input type="date" className="form-input" value={exportDateFrom} onChange={e => setExportDateFrom(e.target.value)} placeholder="Data inicial" />
                                <input type="date" className="form-input" value={exportDateTo} onChange={e => setExportDateTo(e.target.value)} placeholder="Data final" />
                                <select className="form-select" value={exportStatus} onChange={e => setExportStatus(e.target.value)}>
                                    <option value="">Todos os status</option>
                                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                                <select className="form-select" value={exportLocality} onChange={e => setExportLocality(e.target.value)}>
                                    <option value="">Todas localidades</option>
                                    <option value="bh">BH e Região</option>
                                    <option value="fora">Fora de BH</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                                <button className="btn btn-primary" onClick={() => handleExport('orders')}>
                                    <Download size={14} /> Exportar Pedidos (CSV)
                                </button>
                                <button className="btn btn-primary" onClick={() => handleExport('products')}>
                                    <Download size={14} /> Exportar Produtos/Estoque (CSV)
                                </button>
                                <button className="btn btn-primary" onClick={() => handleExport('sales')}>
                                    <Download size={14} /> Exportar Vendas (CSV)
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
