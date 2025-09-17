/**
 * Authentication Middleware
 * Middleware para autenticação e autorização usando JWT Bearer Token
 */

import { Response, NextFunction } from 'express';
import { 
  AuthenticatedRequest, 
  Permission, 
  UserRole,
  RolePermissions 
} from '../types/auth.types';
import { jwtService } from '../services/JWTService';
import logger from '../utils/logger';

/**
 * Middleware de autenticação - Verifica se o usuário está autenticado
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extrai o token do header Authorization
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido',
        code: 'NO_TOKEN'
      });
      return;
    }

    // Valida o token
    const validation = jwtService.validateAccessToken(token);

    if (!validation.valid) {
      const statusCode = validation.expired ? 401 : 403;
      const errorCode = validation.expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
      
      res.status(statusCode).json({
        success: false,
        error: validation.error || 'Token inválido',
        code: errorCode
      });
      return;
    }

    // Adiciona as informações do usuário ao request
    req.user = validation.payload!;
    req.token = token;

    // Verifica se o token está próximo de expirar e adiciona header de aviso
    if (jwtService.isTokenExpiringSoon(token)) {
      res.setHeader('X-Token-Expiring-Soon', 'true');
    }

    logger.http('Requisição autenticada', {
      userId: req.user.userId,
      role: req.user.role,
      path: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    logger.error('Erro no middleware de autenticação', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware de autorização por role - Verifica se o usuário tem a role necessária
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Tentativa de acesso não autorizado', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      });

      res.status(403).json({
        success: false,
        error: 'Acesso negado. Permissão insuficiente.',
        code: 'INSUFFICIENT_ROLE',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware de autorização por permissão - Verifica permissões específicas
 */
export const requirePermission = (...requiredPermissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    // Obtém as permissões do usuário baseadas na role
    const userPermissions = req.user.permissions || RolePermissions[req.user.role] || [];

    // Verifica se o usuário tem todas as permissões necessárias
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      logger.warn('Tentativa de acesso sem permissão', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredPermissions,
        userPermissions,
        path: req.path
      });

      res.status(403).json({
        success: false,
        error: 'Acesso negado. Permissões insuficientes.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermissions,
        userPermissions
      });
      return;
    }

    next();
  };
};

/**
 * Middleware de autenticação opcional - Não bloqueia se não houver token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const validation = jwtService.validateAccessToken(token);
      
      if (validation.valid) {
        req.user = validation.payload!;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    logger.debug('Erro na autenticação opcional', error);
    next();
  }
};

/**
 * Middleware para verificar se o usuário é admin
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED'
    });
    return;
  }

  const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
  
  if (!adminRoles.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: 'Acesso restrito a administradores',
      code: 'ADMIN_ONLY'
    });
    return;
  }

  next();
};

/**
 * Middleware para verificar se o usuário pode acessar um recurso específico
 */
export const canAccessResource = (resourceType: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    // Lógica para verificar acesso ao recurso
    // Por exemplo, verificar se o usuário é dono do recurso
    const resourceId = req.params.id;
    const userId = req.user.userId;

    // Super admin e admin sempre têm acesso
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(req.user.role)) {
      next();
      return;
    }

    // Aqui você implementaria a lógica específica para cada tipo de recurso
    // Por exemplo, verificar no banco se o usuário é dono do recurso
    
    // Por enquanto, vamos permitir acesso se o usuário tem role de MANAGER ou superior
    if ([UserRole.MANAGER].includes(req.user.role)) {
      next();
      return;
    }

    logger.warn('Acesso negado ao recurso', {
      userId,
      resourceType,
      resourceId,
      userRole: req.user.role
    });

    res.status(403).json({
      success: false,
      error: 'Você não tem permissão para acessar este recurso',
      code: 'RESOURCE_ACCESS_DENIED'
    });
  };
};

/**
 * Middleware para rate limiting por usuário
 */
const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

export const userRateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.userId;
    const now = Date.now();
    
    let userRequests = userRequestCounts.get(userId);
    
    if (!userRequests || userRequests.resetTime < now) {
      userRequests = {
        count: 0,
        resetTime: now + windowMs
      };
      userRequestCounts.set(userId, userRequests);
    }

    userRequests.count++;

    if (userRequests.count > maxRequests) {
      const retryAfter = Math.ceil((userRequests.resetTime - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(userRequests.resetTime).toISOString());

      logger.warn('Rate limit excedido', {
        userId,
        requests: userRequests.count,
        limit: maxRequests
      });

      res.status(429).json({
        success: false,
        error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter
      });
      return;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - userRequests.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(userRequests.resetTime).toISOString());

    next();
  };
};

/**
 * Middleware para validar API Key (alternativa ao JWT para integrações)
 */
export const validateApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'API Key não fornecida',
      code: 'NO_API_KEY'
    });
    return;
  }

  // Aqui você validaria a API Key no banco de dados
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    logger.warn('Tentativa de acesso com API Key inválida', {
      apiKey: apiKey.substring(0, 10) + '...',
      ip: req.ip
    });

    res.status(403).json({
      success: false,
      error: 'API Key inválida',
      code: 'INVALID_API_KEY'
    });
    return;
  }

  // Adiciona informações da API Key ao request
  req.user = {
    userId: 'api-key-user',
    email: 'api@system.com',
    role: UserRole.USER,
    permissions: []
  };

  next();
};

/**
 * Limpa caches de rate limiting periodicamente
 */
setInterval(() => {
  const now = Date.now();
  userRequestCounts.forEach((value, key) => {
    if (value.resetTime < now) {
      userRequestCounts.delete(key);
    }
  });
}, 60000); // Limpa a cada minuto
