'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Plus, Pencil, Trash2, ToggleLeft } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice: number | null;
    images: string;
    stock: number;
    active: boolean;
    categoryId: string;
    category: { id: string; name: string };
    createdAt: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function AdminProdutosPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', originalPrice: '', stock: '', categoryId: '', active: true, images: '[]' });
    const [uploading, setUploading] = useState(false);

    const getToken = () => localStorage.getItem('admin_token') || '';

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/products', { headers: { Authorization: `Bearer ${getToken()}` } });
            if (res.status === 401) { router.push('/admin'); return; }
            setProducts(await res.json());
        } catch { } finally { setLoading(false); }
    }, [router]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/categories');
            setCategories(await res.json());
        } catch { }
    }, []);

    useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

    const openCreate = () => {
        setEditProduct(null);
        setForm({ name: '', description: '', price: '', originalPrice: '', stock: '', categoryId: categories[0]?.id || '', active: true, images: '[]' });
        setShowModal(true);
    };

    const openEdit = (p: Product) => {
        setEditProduct(p);
        setForm({ name: p.name, description: p.description, price: p.price.toString(), originalPrice: p.originalPrice ? p.originalPrice.toString() : '', stock: p.stock.toString(), categoryId: p.categoryId, active: p.active, images: p.images });
        setShowModal(true);
    };

    const handleSave = async () => {
        const method = editProduct ? 'PUT' : 'POST';
        const body = editProduct ? { ...form, id: editProduct.id } : form;

        const res = await fetch('/api/admin/products', {
            method,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setShowModal(false);
            fetchProducts();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                const currentImages = JSON.parse(form.images || '[]');
                currentImages.push(data.url);
                setForm(f => ({ ...f, images: JSON.stringify(currentImages) }));
            } else {
                alert('Erro ao fazer upload da imagem');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao fazer upload da imagem');
        } finally {
            setUploading(false);
        }
    };

    const handleToggle = async (p: Product) => {
        await fetch('/api/admin/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ id: p.id, active: !p.active }),
        });
        fetchProducts();
    };

    const handleDelete = async (p: Product) => {
        if (!confirm(`Excluir "${p.name}"? Essa ação não pode ser desfeita.`)) return;
        await fetch(`/api/admin/products?id=${p.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        fetchProducts();
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <div className="admin-main">
                <div className="admin-header">
                    <h1>Produtos</h1>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Novo Produto</button>
                </div>

                {loading ? (
                    <div className="page-loading"><div className="spinner"></div></div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Categoria</th>
                                    <th>Preço</th>
                                    <th>Estoque</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                                        <td>{p.category?.name}</td>
                                        <td>
                                            R$ {p.price.toFixed(2).replace('.', ',')}
                                            {p.originalPrice && (
                                                <span style={{ display: 'block', fontSize: '0.8rem', color: '#888', textDecoration: 'line-through' }}>
                                                    R$ {p.originalPrice.toFixed(2).replace('.', ',')}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${p.stock <= 5 ? 'badge-error' : p.stock <= 15 ? 'badge-warning' : 'badge-green'}`}>
                                                {p.stock} un.
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${p.active ? 'badge-green' : 'badge-gray'}`}>
                                                {p.active ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '.375rem' }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><Pencil size={12} /> Editar</button>
                                                <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(p)}>
                                                    {p.active ? 'Desativar' : 'Ativar'}
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}><Trash2 size={12} /> Excluir</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h2>{editProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                            <div className="form-group">
                                <label className="form-label">Nome *</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Descrição *</label>
                                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Imagens</label>
                                <input type="file" className="form-input" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                {uploading && <span style={{fontSize: '12px', color: 'var(--primary)'}}>Fazendo upload...</span>}
                                {JSON.parse(form.images || '[]').length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                        {JSON.parse(form.images).map((img: string, i: number) => (
                                            <div key={i} style={{ position: 'relative' }}>
                                                <img src={img} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                                <button type="button" onClick={() => {
                                                    const newImgs = JSON.parse(form.images).filter((_: string, idx: number) => idx !== i);
                                                    setForm({...form, images: JSON.stringify(newImgs)});
                                                }} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>X</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Preço (R$) *</label>
                                    <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Preço Original (Opcional)</label>
                                    <input className="form-input" type="number" step="0.01" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="Ex: 199.90" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Estoque *</label>
                                    <input className="form-input" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Categoria *</label>
                                <select className="form-select" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                                    <option value="">Selecione</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                                    <span className="form-label" style={{ margin: 0 }}>Produto ativo</span>
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    {editProduct ? 'Salvar' : 'Criar Produto'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
