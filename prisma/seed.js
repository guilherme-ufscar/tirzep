const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Create admin user
    const adminPassword = bcrypt.hashSync('TirzepBH@Admin$26!', 10);
    await prisma.user.upsert({
        where: { email: 'admin@tg.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@tg.com',
            password: adminPassword,
            role: 'admin',
        },
    });

    // Create categories
    const categories = [
        { name: 'Tirzepatida', slug: 'tirzepatida' },
        { name: 'Retatrutida', slug: 'retatrutida' },
        { name: 'Peptideos / Outros', slug: 'peptideos-outros' },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }

    // Create sample products
    const tirz = await prisma.category.findUnique({ where: { slug: 'tirzepatida' } });
    const reta = await prisma.category.findUnique({ where: { slug: 'retatrutida' } });
    const pept = await prisma.category.findUnique({ where: { slug: 'peptideos-outros' } });

    const products = [
        {
            name: 'TG Ampola',
            slug: 'tg-ampola',
            description: 'TG Tirzepatida em apresentação Ampola - Agonista duplo GLP-1 e GIP para controle metabólico e redução de apetite.',
            price: 189.90,
            stock: 50,
            categoryId: tirz.id,
            images: JSON.stringify(['/files/produtos/TG AMPOLA.webp']),
        },
        {
            name: 'TG Caixa',
            slug: 'tg-caixa',
            description: 'TG Tirzepatida em apresentação Caixa. Ideal para tratamento sequencial.',
            price: 589.90,
            stock: 30,
            categoryId: tirz.id,
            images: JSON.stringify(['/files/produtos/TG CAIXA.webp']),
        },
        {
            name: 'Lipoless 15mg 1 Ampola',
            slug: 'lipoless-15mg-1-ampola',
            description: 'Lipoless Tirzepatida 15mg - Ampola individual com dosagem precisa para protocolo.',
            price: 249.90,
            stock: 40,
            categoryId: tirz.id,
            images: JSON.stringify(['/files/produtos/LIPOLESS 15MG 1 AMPOLA.webp']),
        },
        {
            name: 'Lipoless 4 Ampolas',
            slug: 'lipoless-4-ampolas',
            description: 'Kit Lipoless com 4 Ampolas. Ideal para continuação do tratamento.',
            price: 849.90,
            stock: 25,
            categoryId: tirz.id,
            images: JSON.stringify(['/files/produtos/LIPOLESS 4 AMPOLAS.webp']),
        },
        {
            name: 'Lipoless Caixa 60mg',
            slug: 'lipoless-caixa-60mg',
            description: 'Lipoless Tirzepatida Caixa 60mg - Tratamento completo de alta dosagem e pureza.',
            price: 1299.90,
            stock: 15,
            categoryId: tirz.id,
            images: JSON.stringify(['/files/produtos/LIPOLESS CAIXA 60MG.webp']),
        },
        {
            name: 'Tirzec Caixa 60mg',
            slug: 'tirzec-caixa-60mg',
            description: 'Tirzec 60mg Caixa - Tirzepatida com concentração padronizada avançada.',
            price: 1199.90,
            stock: 20,
            categoryId: tirz.id,
            images: JSON.stringify(['/files/produtos/TIRZEC CAIXA 60MG.webp']),
        },
        {
            name: 'Lipoland Ampola 15mg',
            slug: 'lipoland-ampola-15mg',
            description: 'Lipoland Tirzepatida 15mg - Ampola individual para controle metabólico.',
            price: 269.90,
            stock: 25,
            categoryId: tirz.id,
            images: JSON.stringify(['/files/produtos/LIPOLAND AMPOLA 15MG.webp']),
        },
        {
            name: 'Retatrutide Synedica (Verde)',
            slug: 'retatrutide-synedica-verde',
            description: 'Retatrutide Synedica - Peptídeo triplo agonista (GLP-1, GIP e Glucagon). Pó liofilizado para reconstituição.',
            price: 349.90,
            stock: 15,
            categoryId: reta.id,
            images: JSON.stringify(['/files/produtos/RETATRUIDE (VERDE).webp']),
        },
        {
            name: 'Retatrutide ZPHC',
            slug: 'retatrutide-zphc',
            description: 'Retatrutide ZPHC - Retatrutida triplo agonista em pó liofilizado.',
            price: 329.90,
            stock: 18,
            categoryId: reta.id,
            images: JSON.stringify(['/files/produtos/RETATRUIDE ZPHC.webp']),
        },
        {
            name: 'GHK-Cu',
            slug: 'ghk-cu',
            description: 'GHK-Cu (Glicil-L-Histidil-L-Lisina + Cobre) - Peptídeo regenerativo para colágeno, elastina e saúde da pele.',
            price: 159.90,
            stock: 35,
            categoryId: pept.id,
            images: JSON.stringify(['/files/produtos/GHK-CU.webp']),
        },
    ];

    for (const prod of products) {
        await prisma.product.upsert({
            where: { slug: prod.slug },
            update: prod,
            create: prod,
        });
    }

    console.log('Seed concluido com sucesso!');
    console.log('Admin: admin@tg.com / Senha: TirzepBH@Admin$26!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
