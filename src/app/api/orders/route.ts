import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            customerName,
            customerEmail,
            customerPhone,
            addressStreet,
            addressNumber,
            addressComplement,
            addressNeighborhood,
            addressCity,
            addressState,
            addressZip,
            locality,
            items,
            notes,
        } = body;

        // Validate required fields
        if (!customerName || !customerPhone) {
            return NextResponse.json({ error: 'Preencha todos os campos obrigatórios básicos' }, { status: 400 });
        }
        if (locality === 'bh' && (!addressStreet || !addressNumber || !addressNeighborhood || !addressCity || !addressState || !addressZip)) {
            return NextResponse.json({ error: 'Preencha todos os campos obrigatórios de endereço' }, { status: 400 });
        }

        // Validate phone format
        const phoneClean = customerPhone.replace(/\D/g, '');
        if (phoneClean.length < 10 || phoneClean.length > 11) {
            return NextResponse.json({ error: 'Telefone inválido. Informe com DDD (ex: 31999999999)' }, { status: 400 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
        }

        // Validate locality
        if (locality !== 'bh' && locality !== 'fora') {
            return NextResponse.json({ error: 'Localidade inválida' }, { status: 400 });
        }

        // Calculate total and verify product stock
        let total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                return NextResponse.json({ error: `Produto não encontrado: ${item.name}` }, { status: 400 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json({ error: `Estoque insuficiente para ${product.name}` }, { status: 400 });
            }
            total += product.price * item.quantity;
            orderItems.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
            });
        }

        // Generate order number
        const count = await prisma.order.count();
        const orderNumber = `TG${String(count + 1).padStart(6, '0')}`;

        // Determine payment method and initial status
        const paymentMethod = locality === 'bh' ? 'entrega' : 'online';
        const status = locality === 'bh' ? 'reserva_criada' : 'novo';
        const paymentStatus = locality === 'bh' ? 'pending' : 'pending';

        // Create order
        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerName,
                customerEmail: customerEmail || '',
                customerPhone: phoneClean,
                addressStreet: locality === 'bh' ? addressStreet : 'N/A',
                addressNumber: locality === 'bh' ? addressNumber : 'N/A',
                addressComplement: addressComplement || '',
                addressNeighborhood: locality === 'bh' ? addressNeighborhood : 'N/A',
                addressCity: locality === 'bh' ? addressCity : 'N/A',
                addressState: locality === 'bh' ? addressState : 'N/A',
                addressZip: locality === 'bh' ? addressZip.replace(/\D/g, '') : '00000000',
                locality,
                paymentMethod,
                paymentStatus,
                status,
                notes: notes || '',
                total,
                items: {
                    create: orderItems,
                },
            },
            include: { items: true },
        });

        // Update stock
        for (const item of orderItems) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                locality: order.locality,
                paymentMethod: order.paymentMethod,
                total: order.total,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
            },
        });
    } catch (error) {
        console.error('POST /api/orders error:', error);
        return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
    }
}
