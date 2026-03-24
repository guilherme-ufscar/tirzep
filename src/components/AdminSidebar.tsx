'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Globe, LogOut } from 'lucide-react';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/produtos', label: 'Produtos', icon: Package },
    { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
    { href: '/admin/usuarios', label: 'Usuários', icon: Users },
    { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/admin');
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-logo">
                <Link href="/admin/dashboard">TG Admin</Link>
            </div>
            <ul className="admin-sidebar-nav">
                {navItems.map(item => (
                    <li key={item.href}>
                        <Link href={item.href} className={pathname === item.href ? 'active' : ''}>
                            <item.icon size={16} /> {item.label}
                        </Link>
                    </li>
                ))}
                <li style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: '.5rem' }}>
                    <Link href="/" target="_blank">
                        <Globe size={16} /> Ver Site
                    </Link>
                </li>
                <li>
                    <a href="#" onClick={handleLogout} style={{ color: '#F97066' }}>
                        <LogOut size={16} /> Sair
                    </a>
                </li>
            </ul>
        </aside>
    );
}
