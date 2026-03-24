'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            router.push('/admin/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login-card">
                <h1 style={{ color: 'var(--primary)' }}>TirzepBH</h1>
                <p>Acesse o painel administrativo</p>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ padding: '.75rem', background: '#FEE2E2', color: 'var(--error)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '.875rem', fontWeight: 500 }}>
                            {error}
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@tg.com" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Senha</label>
                        <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className={`btn btn-primary btn-full btn-lg ${loading ? 'loading' : ''}`} disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
