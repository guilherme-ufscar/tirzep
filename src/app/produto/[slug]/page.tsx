'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLocality } from '@/contexts/LocalityContext';
import { useToast } from '@/contexts/ToastContext';
import { getImageUrl } from '@/lib/imageUrl';
import { Truck, CreditCard, MapPin, Package, PackageX, ShoppingCart } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number | null;
    images: string;
    stock: number;
    category: { name: string; slug: string };
}

export default function ProductPage() {
    const params = useParams();
    const { addItem } = useCart();
    const { locality } = useLocality();
    const { showToast } = useToast();
    const [product, setProduct] = useState<Product | null>(null);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.slug) {
            fetch(`/api/products/${params.slug}`)
                .then(r => r.json())
                .then(d => { setProduct(d); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [params.slug]);

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;
    if (!product) return (
        <div className="section">
            <div className="container empty-state">
                <div className="empty-state-icon"><PackageX size={40} /></div>
                <h3>Produto não encontrado</h3>
                <p>O produto que você procura não existe ou foi desativado.</p>
                <Link href="/loja" className="btn btn-primary">Voltar à Loja</Link>
            </div>
        </div>
    );

    const imgs: string[] = JSON.parse(product.images || '[]');

    const handleAdd = () => {
        addItem({ id: product.id, name: product.name, price: product.price, image: getImageUrl(imgs[0] || ''), slug: product.slug }, qty);
        showToast(`${product.name} (x${qty}) adicionado ao carrinho!`);
    };

    return (
        <div className="section">
            <div className="container">
                <div className="breadcrumbs">
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <Link href="/loja">Loja</Link>
                    <span>/</span>
                    <Link href={`/loja?category=${product.category.slug}`}>{product.category.name}</Link>
                    <span>/</span>
                    <span>{product.name}</span>
                </div>

                <div className="product-detail">
                    <div className="product-gallery">
                        {imgs[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getImageUrl(imgs[0])} alt={product.name} />
                        ) : (
                            <div className="placeholder-img" style={{ fontSize: '5rem' }}>{product.name.charAt(0)}</div>
                        )}
                    </div>

                    <div className="product-info">
                        <span className="product-card-category">{product.category.name}</span>
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-price">
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span style={{ fontSize: '1.25rem', color: '#888', textDecoration: 'line-through', marginRight: '0.75rem' }}>
                                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                                </span>
                            )}
                            R$ {product.price.toFixed(2).replace('.', ',')}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                            <span className="badge badge-green"><Truck size={14} /> Frete a combinar</span>
                            {locality === 'bh' && (
                                <span className="badge badge-green"><CreditCard size={14} /> Pagamento na entrega (BH e até 45 km)</span>
                            )}
                        </div>

                        <p className="product-desc">{product.description}</p>

                        {product.stock > 0 ? (
                            <>
                                <div className="product-qty">
                                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                    <span className="qty-value">{qty}</span>
                                    <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                                    <span style={{ fontSize: '.8125rem', color: 'var(--text-secondary)' }}>{product.stock} em estoque</span>
                                </div>
                                <button className="btn btn-primary btn-lg" onClick={handleAdd}>
                                    <ShoppingCart size={18} /> Adicionar ao Carrinho — R$ {(product.price * qty).toFixed(2).replace('.', ',')}
                                </button>
                            </>
                        ) : (
                            <span className="badge badge-error" style={{ fontSize: '1rem', padding: '.75rem 1.5rem' }}>Produto Esgotado</span>
                        )}

                        <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-sm)', marginTop: '.5rem' }}>
                            <p style={{ fontSize: '.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                                {locality === 'bh'
                                    ? 'Você está em BH e região: o pagamento é feito somente na entrega. O WhatsApp será usado apenas para combinar os detalhes finais da entrega.'
                                    : 'Você está fora de BH: o pagamento é feito online no checkout e o envio será realizado após confirmação.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky CTA Mobile */}
            <div className="sticky-cta">
                <span className="product-price" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span style={{ fontSize: '1rem', color: '#888', textDecoration: 'line-through', marginRight: '0.5rem' }}>
                            R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                    )}
                    R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd} disabled={product.stock <= 0}>
                    <ShoppingCart size={16} /> Adicionar ao Carrinho
                </button>
            </div>
        </div>
    );
}
