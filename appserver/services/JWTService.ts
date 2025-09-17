/**
 * JWT Service
 * Serviço para geração, validação e gerenciamento de tokens JWT
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { 
  JWTPayload, 
  JWTConfig, 
  TokenValidationResult,
  RefreshToken,
  UserRole 
} from '../types/auth.types';
import { createLogger } from '../shared/logger';

export class JWTService {
  private config: JWTConfig;
  private refreshTokens: Map<string, RefreshToken> = new Map();
  private logger = createLogger('jwt-service');

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Carrega configuração do JWT das variáveis de ambiente
   */
  private loadConfig(): JWTConfig {
    const accessTokenSecret = process.env.JWT_SECRET || this.generateSecret();
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || this.generateSecret();
    
    if (!process.env.JWT_SECRET) {
      this.logger.warn('JWT_SECRET não configurado, usando secret gerado temporariamente');
    }

    return {
      accessTokenSecret,
      refreshTokenSecret,
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
      issuer: process.env.JWT_ISSUER || 'portal-services-api',
      audience: process.env.JWT_AUDIENCE || 'portal-services-client'
    };
  }

  /**
   * Gera um secret aleatório (apenas para desenvolvimento)
   */
  private generateSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Gera um Access Token JWT
   */
  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>): string {
    const jti = crypto.randomBytes(16).toString('hex');
    
    const token = jwt.sign(
      {
        ...payload,
        jti
      },
      this.config.accessTokenSecret,
      {
        expiresIn: this.config.accessTokenExpiry,
        issuer: this.config.issuer,
        audience: this.config.audience,
        algorithm: 'HS256'
      } as jwt.SignOptions
    );

    this.logger.info('Access token gerado', {
      userId: payload.userId,
      role: payload.role,
      jti
    });

    return token;
  }

  /**
   * Gera um Refresh Token
   */
  generateRefreshToken(userId: string, userAgent?: string, ipAddress?: string): string {
    const tokenId = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign(
      { 
        userId,
        tokenId,
        type: 'refresh'
      },
      this.config.refreshTokenSecret,
      {
        expiresIn: this.config.refreshTokenExpiry,
        issuer: this.config.issuer,
        algorithm: 'HS256'
      } as jwt.SignOptions
    );

    // Armazena o refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    const refreshToken: RefreshToken = {
      id: tokenId,
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
      userAgent,
      ipAddress
    };

    this.refreshTokens.set(tokenId, refreshToken);

    this.logger.info('Refresh token gerado', {
      userId,
      tokenId,
      userAgent,
      ipAddress
    });

    return token;
  }

  /**
   * Valida um Access Token
   */
  validateAccessToken(token: string): TokenValidationResult {
    try {
      const decoded = jwt.verify(token, this.config.accessTokenSecret, {
        issuer: this.config.issuer,
        audience: this.config.audience,
        algorithms: ['HS256']
      }) as JWTPayload;

      return {
        valid: true,
        payload: decoded
      };
    } catch (error: any) {
      this.logger.warn('Falha na validação do access token', {
        error: error.message,
        token: token.substring(0, 20) + '...'
      });

      return {
        valid: false,
        error: error.message,
        expired: error.name === 'TokenExpiredError'
      };
    }
  }

  /**
   * Valida um Refresh Token
   */
  validateRefreshToken(token: string): TokenValidationResult {
    try {
      const decoded = jwt.verify(token, this.config.refreshTokenSecret, {
        issuer: this.config.issuer,
        algorithms: ['HS256']
      }) as any;

      // Verifica se o token ainda está armazenado e válido
      const storedToken = this.refreshTokens.get(decoded.tokenId);
      
      if (!storedToken) {
        throw new Error('Refresh token não encontrado');
      }

      if (storedToken.revokedAt) {
        throw new Error('Refresh token revogado');
      }

      if (storedToken.expiresAt < new Date()) {
        throw new Error('Refresh token expirado');
      }

      return {
        valid: true,
        payload: {
          userId: decoded.userId,
          email: '',
          role: UserRole.USER
        }
      };
    } catch (error: any) {
      this.logger.warn('Falha na validação do refresh token', {
        error: error.message
      });

      return {
        valid: false,
        error: error.message,
        expired: error.name === 'TokenExpiredError'
      };
    }
  }

  /**
   * Renova um Access Token usando um Refresh Token
   */
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    const validation = this.validateRefreshToken(refreshToken);
    
    if (!validation.valid || !validation.payload) {
      return null;
    }

    // Aqui você buscaria os dados atualizados do usuário do banco
    // Por enquanto, vamos usar dados mock
    const newPayload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'> = {
      userId: validation.payload.userId,
      email: 'user@example.com', // Buscar do banco
      role: UserRole.USER, // Buscar do banco
      permissions: [] // Buscar do banco
    };

    return this.generateAccessToken(newPayload);
  }

  /**
   * Revoga um Refresh Token
   */
  revokeRefreshToken(tokenId: string): boolean {
    const token = this.refreshTokens.get(tokenId);
    
    if (token) {
      token.revokedAt = new Date();
      this.logger.info('Refresh token revogado', { tokenId });
      return true;
    }

    return false;
  }

  /**
   * Revoga todos os Refresh Tokens de um usuário
   */
  revokeAllUserTokens(userId: string): number {
    let count = 0;
    
    this.refreshTokens.forEach((token, tokenId) => {
      if (token.userId === userId && !token.revokedAt) {
        token.revokedAt = new Date();
        count++;
      }
    });

    this.logger.info('Todos os refresh tokens do usuário revogados', {
      userId,
      count
    });

    return count;
  }

  /**
   * Limpa tokens expirados (deve ser executado periodicamente)
   */
  cleanupExpiredTokens(): number {
    const now = new Date();
    let removed = 0;

    this.refreshTokens.forEach((token, tokenId) => {
      if (token.expiresAt < now || token.revokedAt) {
        this.refreshTokens.delete(tokenId);
        removed++;
      }
    });

    if (removed > 0) {
      this.logger.info('Tokens expirados removidos', { count: removed });
    }

    return removed;
  }

  /**
   * Extrai o token do header Authorization
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Decodifica um token sem validar (útil para debugging)
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica se um token está próximo de expirar
   */
  isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
    const decoded = this.decodeToken(token) as any;
    
    if (!decoded || !decoded.exp) {
      return true;
    }

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    const thresholdMs = thresholdMinutes * 60 * 1000;

    return timeUntilExpiry <= thresholdMs;
  }

  /**
   * Gera um token temporário para operações específicas (reset de senha, etc)
   */
  generateTemporaryToken(purpose: string, data: any, expiresIn: string = '1h'): string {
    return jwt.sign(
      {
        purpose,
        data,
        type: 'temporary'
      },
      this.config.accessTokenSecret,
      {
        expiresIn,
        issuer: this.config.issuer,
        algorithm: 'HS256'
      } as jwt.SignOptions
    );
  }

  /**
   * Valida um token temporário
   */
  validateTemporaryToken(token: string, expectedPurpose: string): TokenValidationResult {
    try {
      const decoded = jwt.verify(token, this.config.accessTokenSecret, {
        issuer: this.config.issuer,
        algorithms: ['HS256']
      }) as any;

      if (decoded.type !== 'temporary' || decoded.purpose !== expectedPurpose) {
        throw new Error('Token inválido para esta operação');
      }

      return {
        valid: true,
        payload: decoded.data
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message,
        expired: error.name === 'TokenExpiredError'
      };
    }
  }
}

// Singleton instance
export const jwtService = new JWTService();
