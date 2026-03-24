import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error('GET /api/admin/users error:', error);
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { name, email, password, role } = await request.json();
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword(password),
                role: role || 'attendant',
            },
            select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
        });

        await prisma.auditLog.create({
            data: {
                userId: auth.userId,
                action: 'create',
                entity: 'user',
                entityId: user.id,
                details: `Usuário criado: ${name} (${role || 'attendant'})`,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('POST /api/admin/users error:', error);
        return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { id, name, email, role, active, password } = await request.json();
        if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {};
        if (name) data.name = name;
        if (email) data.email = email;
        if (role) data.role = role;
        if (active !== undefined) data.active = active;
        if (password) data.password = hashPassword(password);

        const user = await prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
        });

        await prisma.auditLog.create({
            data: {
                userId: auth.userId,
                action: 'update',
                entity: 'user',
                entityId: user.id,
                details: `Usuário atualizado: ${user.name}`,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('PUT /api/admin/users error:', error);
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}
