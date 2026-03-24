'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Search, ShoppingCart } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
}

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number | null;
    images: string;
    stock: number;
    category: { name: string; slug: string };
}

export default function LojaPage() {
    const { addItem } = useCart();
    const { showToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/categories')
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setCategories(data);
                else setCategories([]);
            })
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (search) params.set('search', search);
        fetch(`/api/products?${params.toString()}`)
            .then(r => r.json())
            .then(d => {
                if (d && Array.isArray(d.products)) {
                    setProducts(d.products);
                } else {
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch(() => { setProducts([]); setLoading(false); });
    }, [selectedCategory, search]);

    const handleAdd = (p: Product) => {
        const imgs = JSON.parse(p.images || '[]');
        addItem({ id: p.id, name: p.name, price: p.price, image: imgs[0] || '', slug: p.slug });
        showToast(`${p.name} adicionado ao carrinho!`);
    };

    return (
        <div className="section">
            <div className="container">
                <h1 style={{ marginBottom: '.5rem' }}>Loja</h1>
                <p style={{ marginBottom: '2rem' }}>Explore nosso catálogo completo de produtos de alta qualidade.</p>

                {/* Filters */}
                <div className="admin-filters" style={{ marginBottom: '2rem' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Buscar produto..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ maxWidth: '300px' }}
                    />
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        style={{ maxWidth: '200px' }}
                    >
                        <option value="">Todas categorias</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.slug}>{c.name} ({c._count.products})</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="page-loading"><div className="spinner"></div></div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Search size={40} /></div>
                        <h3>Nenhum produto encontrado</h3>
                        <p>Tente ajustar os filtros ou buscar por outro termo.</p>
                    </div>
                ) : (
                    <div className="product-grid">
                        {products.map(p => {
                            const imgs = JSON.parse(p.images || '[]');
                            return (
                                <div key={p.id} className="card product-card">
                                    <Link href={`/produto/${p.slug}`}>
                                        <div className="product-card-img">
                                            {imgs[0] ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={imgs[0]} alt={p.name} />
                                            ) : (
                                                <div className="placeholder-img">{p.name.charAt(0)}</div>
                                            )}
                                            <div className="product-card-badge">
                                                <span className="badge badge-green">Frete a combinar</span>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="product-card-body">
                                        <span className="product-card-category">{p.category?.name}</span>
                                        <Link href={`/produto/${p.slug}`} style={{ textDecoration: 'none' }}>
                                            <h3 className="product-card-name">{p.name}</h3>
                                        </Link>
                                        <div className="product-card-price">
                                            {p.originalPrice && p.originalPrice > p.price && (
                                                <span style={{ fontSize: '0.9rem', color: '#888', textDecoration: 'line-through', marginRight: '0.5rem' }}>
                                                    R$ {p.originalPrice.toFixed(2).replace('.', ',')}
                                                </span>
                                            )}
                                            R$ {p.price.toFixed(2).replace('.', ',')}
                                        </div>
                                        {p.stock <= 0 && <span className="badge badge-error" style={{ marginBottom: '.5rem' }}>Esgotado</span>}
                                        <div className="product-card-footer">
                                            <button
                                                className="btn btn-primary btn-full"
                                                onClick={() => handleAdd(p)}
                                                disabled={p.stock <= 0}
                                            >
                                                {p.stock > 0 ? <><ShoppingCart size={16} /> Adicionar ao Carrinho</> : 'Indisponível'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
