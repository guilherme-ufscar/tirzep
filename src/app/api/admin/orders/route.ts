import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const locality = searchParams.get('locality');
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const product = searchParams.get('product');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (status) where.status = status;
        if (locality) where.locality = locality;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59');
        }
        if (product) {
            where.items = { some: { name: { contains: product } } };
        }

        const orders = await prisma.order.findMany({
            where,
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('GET /api/admin/orders error:', error);
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const { id, status, paymentStatus, notes } = await request.json();
        if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

        const order = await prisma.order.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(paymentStatus && { paymentStatus }),
                ...(notes !== undefined && { notes }),
            },
            include: { items: true },
        });

        await prisma.auditLog.create({
            data: {
                userId: auth.userId,
                action: 'update_status',
                entity: 'order',
                entityId: order.id,
                details: `Pedido ${order.orderNumber} atualizado para ${status || order.status}`,
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('PUT /api/admin/orders error:', error);
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}
