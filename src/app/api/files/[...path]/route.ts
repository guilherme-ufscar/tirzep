import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join, extname, resolve } from 'path';

const UPLOADS_ROOT = join(process.cwd(), 'uploads');
const PUBLIC_FILES_ROOT = join(process.cwd(), 'public', 'files');

const MIME_TYPES: Record<string, string> = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const relativePath = path.join('/');

        // Primeiro tenta buscar em uploads/ (novos uploads)
        let filePath = resolve(join(UPLOADS_ROOT, relativePath));

        // Segurança: impede path traversal
        if (!filePath.startsWith(UPLOADS_ROOT) && !filePath.startsWith(PUBLIC_FILES_ROOT)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Se não encontrar em uploads/, tenta em public/files/ (arquivos antigos)
        try {
            await access(filePath);
        } catch {
            filePath = resolve(join(PUBLIC_FILES_ROOT, relativePath));
            // Segurança: impede path traversal
            if (!filePath.startsWith(PUBLIC_FILES_ROOT)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            await access(filePath);
        }

        const fileBuffer = await readFile(filePath);
        const ext = extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch {
        return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }
}
