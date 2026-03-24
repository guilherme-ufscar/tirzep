'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Plus, Pencil } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
}

const ROLES: Record<string, string> = {
    admin: 'Admin Total',
    attendant: 'Atendimento',
    stock: 'Estoque',
    reports: 'Relatórios',
};

export default function AdminUsuariosPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendant', active: true });

    const getToken = () => localStorage.getItem('admin_token') || '';

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${getToken()}` } });
            if (res.status === 401) { router.push('/admin'); return; }
            setUsers(await res.json());
        } catch { } finally { setLoading(false); }
    }, [router]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const openCreate = () => {
        setEditUser(null);
        setForm({ name: '', email: '', password: '', role: 'attendant', active: true });
        setShowModal(true);
    };

    const openEdit = (u: User) => {
        setEditUser(u);
        setForm({ name: u.name, email: u.email, password: '', role: u.role, active: u.active });
        setShowModal(true);
    };

    const handleSave = async () => {
        const method = editUser ? 'PUT' : 'POST';
        const body = editUser
            ? { id: editUser.id, ...form, ...(form.password ? {} : { password: undefined }) }
            : form;

        const res = await fetch('/api/admin/users', {
            method,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setShowModal(false);
            fetchUsers();
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <div className="admin-main">
                <div className="admin-header">
                    <h1>Usuários Internos</h1>
                    <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Novo Usuário</button>
                </div>

                {loading ? (
                    <div className="page-loading"><div className="spinner"></div></div>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Permissão</th>
                                    <th>Status</th>
                                    <th>Criado em</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td><span className="badge badge-info">{ROLES[u.role] || u.role}</span></td>
                                        <td><span className={`badge ${u.active ? 'badge-green' : 'badge-gray'}`}>{u.active ? 'Ativo' : 'Inativo'}</span></td>
                                        <td style={{ fontSize: '.8125rem' }}>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}><Pencil size={12} /> Editar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h2>{editUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                            <div className="form-group">
                                <label className="form-label">Nome *</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{editUser ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}</label>
                                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Permissão/Role *</label>
                                <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                    {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                                    <span className="form-label" style={{ margin: 0 }}>Usuário ativo</span>
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleSave}>{editUser ? 'Salvar' : 'Criar Usuário'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
