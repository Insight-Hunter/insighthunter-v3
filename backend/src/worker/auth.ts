import jwt from 'jsonwebtoken';

const JWT_SECRET = env.JWT_SECRET;

export function getUserId(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
    return decoded.userId || null;
  } catch {
    return null;
  }
}
