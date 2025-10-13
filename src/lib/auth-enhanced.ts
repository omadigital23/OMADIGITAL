import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  mfaEnabled: boolean;
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  static generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
  
  static verifyToken(token: string): User | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as User;
    } catch {
      return null;
    }
  }
  
  static generateMFASecret(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}