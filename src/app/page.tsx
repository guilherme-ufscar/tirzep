'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocality } from '@/contexts/LocalityContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Zap, Truck, Package, CreditCard, Gift, Snowflake, Syringe, ShieldCheck, Rocket, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  images: string;
  category: { name: string };
}

export default function HomePage() {
  const { locality } = useLocality();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products?limit=4')
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => { });
  }, []);

  const handleAdd = (p: Product) => {
    const imgs = JSON.parse(p.images || '[]');
    addItem({ id: p.id, name: p.name, price: p.price, image: imgs[0] || '', slug: p.slug });
    showToast(`${p.name} adicionado ao carrinho!`);
  };

  return (
    <>
      {/* HERO with Video */}
      <section className="hero">
        <div className="container">
          <div className="hero-content" style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
            <div className="hero-text" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="hero-badges" style={{ justifyContent: 'center' }}>
                <span className="badge badge-green"><Rocket size={14} /> Entrega rápida em BH</span>
                <span className="badge badge-green"><Snowflake size={14} /> Envio com gelo</span>
              </div>
              <h1>Peptídeos e Compostos de Alta Qualidade</h1>
              <p>
                Sua loja de confiança para tirzepatida, retatrutida e peptídeos.
                {locality === 'bh'
                  ? ' Pagamento somente na entrega para BH e região (até 45 km). Entrega rápida!'
                  : ' Pagamento online + envio para todo o Brasil!'}
              </p>
              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/loja" className="btn btn-primary btn-lg">
                  Ver Produtos
                </Link>
                <Link href="/comparativos" className="btn btn-outline btn-lg">
                  Comparativos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="trust-section">
        <div className="container">
          <h2 className="text-center" style={{ marginBottom: '2rem' }}>Por que escolher a TirzepBH?</h2>
          <div className="trust-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className="trust-item">
              <div className="trust-item-icon"><CreditCard size={28} /></div>
              <h4>Pagamento na Entrega</h4>
              <p>Para BH e região (até 45 km), você paga somente na entrega. Sem complicação!</p>
              <span className="badge badge-green" style={{ marginTop: '.75rem' }}>Somente BH e até 45 km</span>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon"><Zap size={28} /></div>
              <h4>Entrega Rápida</h4>
              <p>Após reservar, a entrega pode acontecer rapidamente. Nosso objetivo é agilidade!</p>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon"><Truck size={28} /></div>
              <h4>Frete a Combinar</h4>
              <p>Frete combinado diretamente para garantir o melhor custo-benefício para você.</p>
              <span className="badge badge-green" style={{ marginTop: '.75rem' }}>Frete a combinar</span>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon"><Package size={28} /></div>
              <h4>Envio Nacional</h4>
              <p>Para outros estados, pagamento online no site + envio com total segurança.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Enviamos */}
      <section className="envio-section">
        <div className="container">
          <div className="envio-content">
            <div>
              <span className="badge badge-green" style={{ marginBottom: '1rem', display: 'inline-flex' }}><Package size={14} /> Como enviamos</span>
              <h2>Como enviamos os pedidos</h2>
              <p style={{ fontSize: '1.125rem', marginTop: '1rem', lineHeight: '1.8' }}>
                Todos nossos pedidos são enviados com gelo, cartão fidelidade, seringas de brinde e álcool pra assepsia
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                <span className="badge badge-green"><Snowflake size={14} /> Gelo</span>
                <span className="badge badge-green"><CreditCard size={14} /> Cartão Fidelidade</span>
                <span className="badge badge-green"><Syringe size={14} /> Seringas de Brinde</span>
                <span className="badge badge-green"><ShieldCheck size={14} /> Álcool para Assepsia</span>
              </div>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/files/imagens/exemplo.webp"
                alt="Exemplo de envio com gelo, seringas e álcool"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2>Produtos em Destaque</h2>
            <Link href="/loja" className="btn btn-secondary btn-sm">Ver todos →</Link>
          </div>
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
                    <div className="product-card-footer">
                      <button className="btn btn-primary btn-full" onClick={() => handleAdd(p)}>
                        <ShoppingCart size={16} /> Adicionar ao Carrinho
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cartão Fidelidade */}
      <section className="fidelidade-section">
        <div className="container">
          <div className="fidelidade-content">
            <div>
              <span className="badge badge-green" style={{ marginBottom: '1rem', display: 'inline-flex' }}><Gift size={14} /> Programa de Fidelidade</span>
              <h2>Cartão Fidelidade</h2>
              <p style={{ fontSize: '1.125rem', marginTop: '1rem', lineHeight: '1.8' }}>
                Acumule compras e ganhe benefícios exclusivos! Nosso cartão fidelidade acompanha todos os envios —
                quanto mais você compra, mais vantagens ganha.
              </p>
              <Link href="/loja" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Comprar e Acumular →
              </Link>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/files/imagens/cartao-fidelidade.webp" alt="Cartão Fidelidade TirzepBH" />
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Info */}
      <section className="section" style={{ background: 'var(--card)' }}>
        <div className="container text-center" style={{ maxWidth: '640px' }}>
          <h2>Como funciona o pedido?</h2>
          <p style={{ fontSize: '1.125rem', marginTop: '1rem' }}>
            O site contém todas as informações que você precisa — preços, composições, comparativos e formas de pagamento.
            <strong> Não é necessário perguntar no WhatsApp o que já está explicado aqui.</strong>
          </p>
          {locality === 'bh' ? (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: 'var(--primary)' }}>Para BH e região (até 45 km):</h4>
              <p style={{ marginTop: '.5rem', color: 'var(--text-primary)' }}>
                1. Escolha seus produtos e finalize no site como <strong>Reserva</strong><br />
                2. O WhatsApp será usado apenas para combinar detalhes da entrega<br />
                3. O <strong>pagamento é feito na entrega</strong> (motoboy)
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#E0F2FE', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: '#0369A1' }}>Para fora de BH (outros estados):</h4>
              <p style={{ marginTop: '.5rem', color: 'var(--text-primary)' }}>
                1. Escolha seus produtos e finalize com pagamento online<br />
                2. Após confirmação, o pedido é enviado para o endereço cadastrado<br />
                3. Acompanhe o status do pedido pelo site
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Depoimentos */}
      <section className="section">
        <div className="container">
          <h2 className="text-center" style={{ marginBottom: '2rem' }}>O que nossos clientes dizem</h2>
          <div className="trust-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {depoimentos.map((dep, idx) => (
              <div key={idx} style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dep}
                  alt={`Depoimento ${idx + 1}`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video no final da pagina */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '2rem' }}>Conheça Mais Sobre Nossos Produtos</h2>
          <div style={{
            margin: '0 auto',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            width: 'fit-content'
          }}>
            <video
              src="/files/video/video.mp4"
              controls
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '80vh',
                width: 'auto',
                height: 'auto'
              }}
              poster="/files/imagens/exemplo.webp"
            />
          </div>
        </div>
      </section>
    </>
  );
}

const depoimentos = [
  "/files/imagens/depoimento1.webp",
  "/files/imagens/depoimento2.webp",
  "/files/imagens/depoimento3.webp",
  "/files/imagens/depoimento4.webp",
  "/files/imagens/depoimento5.webp"
];
