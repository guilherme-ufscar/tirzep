import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // orders, products, sales
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const status = searchParams.get('status');
        const locality = searchParams.get('locality');

        let csv = '';

        if (type === 'orders') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const where: any = {};
            if (status) where.status = status;
            if (locality) where.locality = locality;
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom) where.createdAt.gte = new Date(dateFrom);
                if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59');
            }

            const orders = await prisma.order.findMany({
                where,
                include: { items: true },
                orderBy: { createdAt: 'desc' },
            });

            csv = 'Número,Data,Cliente,Telefone,Cidade,Estado,Localidade,Status,Pagamento,Total,Itens\n';
            orders.forEach(o => {
                const items = o.items.map(i => `${i.name} x${i.quantity}`).join(' | ');
                const date = o.createdAt.toISOString().split('T')[0];
                csv += `${o.orderNumber},${date},"${o.customerName}",${o.customerPhone},${o.addressCity},${o.addressState},${o.locality === 'bh' ? 'BH' : 'Fora'},${o.status},${o.paymentMethod === 'entrega' ? 'Na entrega' : 'Online'},${o.total.toFixed(2)},"${items}"\n`;
            });
        } else if (type === 'products') {
            const products = await prisma.product.findMany({
                include: { category: true },
                orderBy: { name: 'asc' },
            });

            csv = 'Nome,Categoria,Preço,Estoque,Ativo\n';
            products.forEach(p => {
                csv += `"${p.name}","${p.category.name}",${p.price.toFixed(2)},${p.stock},${p.active ? 'Sim' : 'Não'}\n`;
            });
        } else if (type === 'sales') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const where: any = { status: { not: 'cancelado' } };
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom) where.createdAt.gte = new Date(dateFrom);
                if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59');
            }

            const orders = await prisma.order.findMany({
                where,
                select: { createdAt: true, total: true, locality: true, paymentMethod: true },
                orderBy: { createdAt: 'asc' },
            });

            // Aggregate by day
            const daily: Record<string, { date: string; total: number; count: number; bh: number; fora: number }> = {};
            orders.forEach(o => {
                const day = o.createdAt.toISOString().split('T')[0];
                if (!daily[day]) daily[day] = { date: day, total: 0, count: 0, bh: 0, fora: 0 };
                daily[day].total += o.total;
                daily[day].count += 1;
                if (o.locality === 'bh') daily[day].bh += 1;
                else daily[day].fora += 1;
            });

            csv = 'Data,Total Vendas,Qtd Pedidos,Pedidos BH,Pedidos Fora\n';
            Object.values(daily).forEach(d => {
                csv += `${d.date},${d.total.toFixed(2)},${d.count},${d.bh},${d.fora}\n`;
            });
        } else {
            return NextResponse.json({ error: 'Tipo inválido (orders, products, sales)' }, { status: 400 });
        }

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('GET /api/admin/export error:', error);
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}
