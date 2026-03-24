import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        // Total orders
        const totalOrders = await prisma.order.count();
        const totalRevenue = await prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelado' } } });

        // Orders by status
        const ordersByStatus = await prisma.order.groupBy({
            by: ['status'],
            _count: true,
        });

        // Orders by locality
        const ordersByLocality = await prisma.order.groupBy({
            by: ['locality'],
            _count: true,
        });

        // Products with low stock
        const lowStockProducts = await prisma.product.findMany({
            where: { stock: { lte: 5 }, active: true },
            include: { category: true },
            orderBy: { stock: 'asc' },
        });

        // Recent orders (30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentOrders = await prisma.order.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true, total: true, status: true, locality: true },
            orderBy: { createdAt: 'asc' },
        });

        // Daily sales aggregation
        const dailySales: Record<string, { date: string; total: number; count: number }> = {};
        recentOrders.forEach(o => {
            const day = o.createdAt.toISOString().split('T')[0];
            if (!dailySales[day]) dailySales[day] = { date: day, total: 0, count: 0 };
            if (o.status !== 'cancelado') {
                dailySales[day].total += o.total;
                dailySales[day].count += 1;
            }
        });

        // Products stock
        const allProducts = await prisma.product.findMany({
            where: { active: true },
            select: { name: true, stock: true, category: { select: { name: true } } },
            orderBy: { stock: 'asc' },
        });

        // Total products
        const totalProducts = await prisma.product.count({ where: { active: true } });

        // Pending orders (need attention)
        const pendingOrders = await prisma.order.count({
            where: { status: { in: ['novo', 'reserva_criada'] } },
        });

        return NextResponse.json({
            totalOrders,
            totalRevenue: totalRevenue._sum.total || 0,
            totalProducts,
            pendingOrders,
            ordersByStatus,
            ordersByLocality,
            lowStockProducts,
            dailySales: Object.values(dailySales),
            productsStock: allProducts,
        });
    } catch (error) {
        console.error('GET /api/admin/stats error:', error);
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}
