import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Diretório de uploads fora do public, para evitar problemas com Next.js
const UPLOADS_ROOT = join(process.cwd(), 'uploads');

export async function POST(request: NextRequest) {
    const auth = authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Limpa o nome do arquivo, preservando hifens e underscores
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${Date.now()}-${safeName}`;

        const dirPath = join(UPLOADS_ROOT, 'produtos');
        await mkdir(dirPath, { recursive: true });

        const filePath = join(dirPath, fileName);
        await writeFile(filePath, buffer);

        // Retorna URL usando a rota API de servir arquivos
        const url = `/api/files/produtos/${fileName}`;

        return NextResponse.json({ url, success: true });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
    }
}
