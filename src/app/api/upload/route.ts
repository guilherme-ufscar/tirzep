import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
        const fileName = `${Date.now()}-${safeName}`;
        const relativePath = `/files/produtos/${fileName}`;
        
        const dirPath = join(process.cwd(), 'public', 'files', 'produtos');
        try {
            await mkdir(dirPath, { recursive: true });
        } catch (e) {}
        
        const path = join(dirPath, fileName);
        await writeFile(path, buffer);

        return NextResponse.json({ url: relativePath, success: true });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
    }
}
