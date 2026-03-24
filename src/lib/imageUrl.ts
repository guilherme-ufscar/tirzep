/**
 * Normaliza a URL de imagem de produto para usar a rota API de arquivos.
 * Converte URLs antigas (/files/...) para o formato novo (/api/files/...).
 * URLs externas (http/https) e URLs que já usam /api/files são mantidas.
 */
export function getImageUrl(url: string): string {
    if (!url) return '';
    
    // URLs externas - manter como estão
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    
    // Já está usando a rota API
    if (url.startsWith('/api/files/')) return url;
    
    // URL antiga do formato /files/... -> converter para /api/files/...
    if (url.startsWith('/files/')) {
        return `/api/files${url.replace('/files', '')}`;
    }
    
    return url;
}
