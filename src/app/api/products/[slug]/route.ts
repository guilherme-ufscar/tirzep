import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const product = await prisma.product.findUnique({
            where: { slug },
            include: { category: true },
        });

        if (!product) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('GET /api/products/[slug] error:', error);
        return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 });
    }
}
