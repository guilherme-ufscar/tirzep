import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'tg-ecommerce-secret-key-2024';

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

export function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export function getTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim());
        const tokenCookie = cookies.find(c => c.startsWith('admin_token='));
        if (tokenCookie) {
            return tokenCookie.split('=')[1];
        }
    }
    return null;
}

export function authenticateRequest(request: Request): JWTPayload | null {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
}
