import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const active = searchParams.get('active');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (search) where.name = { contains: search };
        if (category) where.categoryId = category;
        if (active === 'true') where.active = true;
        if (active === 'false') where.active = false;

        const products = await prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('GET /api/admin/products error:', error);
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    if (auth.role !== 'admin' && auth.role !== 'stock') {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, description, price, originalPrice, stock, categoryId, images, active } = body;

        if (!name || !description || price === undefined || !categoryId) {
            return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
        }

        const slug = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check for unique slug
        const existing = await prisma.product.findUnique({ where: { slug } });
        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        const product = await prisma.product.create({
            data: {
                name,
                slug: finalSlug,
                description,
                price: parseFloat(price),
                originalPrice: originalPrice ? parseFloat(originalPrice) : null,
                stock: parseInt(stock) || 0,
                categoryId,
                images: images || '[]',
                active: active !== false,
            },
            include: { category: true },
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: auth.userId,
                action: 'create',
                entity: 'product',
                entityId: product.id,
                details: `Produto criado: ${name}`,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('POST /api/admin/products error:', error);
        return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const { id, name, description, price, originalPrice, stock, categoryId, images, active } = body;

        if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
                ...(stock !== undefined && { stock: parseInt(stock) }),
                ...(categoryId && { categoryId }),
                ...(images !== undefined && { images }),
                ...(active !== undefined && { active }),
            },
            include: { category: true },
        });

        await prisma.auditLog.create({
            data: {
                userId: auth.userId,
                action: 'update',
                entity: 'product',
                entityId: product.id,
                details: `Produto atualizado: ${product.name}`,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('PUT /api/admin/products error:', error);
        return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth || auth.role !== 'admin') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

        await prisma.product.delete({ where: { id } });

        await prisma.auditLog.create({
            data: {
                userId: auth.userId,
                action: 'delete',
                entity: 'product',
                entityId: id,
                details: `Produto excluído`,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/admin/products error:', error);
        return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
    }
}
