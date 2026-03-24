import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '100');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (category) where.category = { slug: category };
        if (search) where.name = { contains: search };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: true },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip,
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({ products, total, page, limit });
    } catch (error) {
        console.error('GET /api/products error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro' }, { status: 500 });
    }
}
