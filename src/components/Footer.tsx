import React from 'react';
import Link from 'next/link';
import { MapPin, Package, Truck } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <h4>TirzepBH</h4>
                        <p>Sua loja de confiança para peptídeos e compostos de alta qualidade. Entrega rápida em BH e região, envio para todo o Brasil.</p>
                    </div>
                    <div>
                        <h4>Navegação</h4>
                        <ul className="footer-links">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/loja">Loja</Link></li>
                            <li><Link href="/comparativos">Comparativos</Link></li>
                            <li><Link href="/carrinho">Carrinho</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Informações</h4>
                        <ul className="footer-links">
                            <li><span style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}><MapPin size={14} /> BH e região: pagamento na entrega</span></li>
                            <li><span style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}><Package size={14} /> Fora de BH: pagamento online + envio</span></li>
                            <li><span style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}><Truck size={14} /> Frete a combinar</span></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} TirzepBH — Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
