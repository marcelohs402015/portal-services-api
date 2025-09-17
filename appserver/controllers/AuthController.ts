/**
 * Authentication Controller
 * Controller para gerenciar autenticação e autorização
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { 
  AuthenticatedRequest, 
  AuthResponse,
  LoginCredentials 
} from '../types/auth.types';
import { userService } from '../services/UserService';
import { jwtService } from '../services/JWTService';
import { createLogger } from '../shared/logger';

const logger = createLogger('auth-controller');

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional()
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['user', 'guest']).optional() // Apenas roles básicas para auto-registro
});

const refreshTokenSchema = z.object({
  refreshToken: z.string()
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email('Email inválido')
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
});

export class AuthController {
  /**
   * Login de usuário
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Valida dados de entrada
      const validatedData = loginSchema.parse(req.body);
      
      // Autentica o usuário
      const user = await userService.authenticateUser(validatedData as LoginCredentials);
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Credenciais inválidas',
          code: 'INVALID_CREDENTIALS'
        });
        return;
      }

      // Gera tokens
      const accessToken = jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      });

      const refreshToken = jwtService.generateRefreshToken(
        user.id,
        req.headers['user-agent'],
        req.ip
      );

      // Calcula expiração
      const expiresIn = validatedData.rememberMe ? 7 * 24 * 60 * 60 : 15 * 60; // 7 dias ou 15 minutos

      // Resposta de sucesso
      const response: AuthResponse = {
        success: true,
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        }
      };

      logger.info('Login bem-sucedido', {
        userId: user.id,
        email: user.email,
        rememberMe: validatedData.rememberMe
      });

      res.status(200).json(response);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
        return;
      }

      logger.error('Erro no login', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao fazer login',
        code: 'LOGIN_ERROR'
      });
    }
  }

  /**
   * Registro de novo usuário
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Valida dados de entrada
      const validatedData = registerSchema.parse(req.body);
      
      // Cria o usuário
      const user = await userService.createUser({
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
        role: validatedData.role as any || 'user'
      });

      logger.info('Novo usuário registrado', {
        userId: user.id,
        email: user.email
      });

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
        return;
      }

      if (error.message === 'Email já cadastrado') {
        res.status(409).json({
          success: false,
          error: 'Email já está em uso',
          code: 'EMAIL_IN_USE'
        });
        return;
      }

      logger.error('Erro no registro', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao registrar usuário',
        code: 'REGISTER_ERROR'
      });
    }
  }

  /**
   * Refresh do access token
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Valida dados de entrada
      const validatedData = refreshTokenSchema.parse(req.body);
      
      // Renova o access token
      const newAccessToken = await jwtService.refreshAccessToken(validatedData.refreshToken);
      
      if (!newAccessToken) {
        res.status(401).json({
          success: false,
          error: 'Refresh token inválido ou expirado',
          code: 'INVALID_REFRESH_TOKEN'
        });
        return;
      }

      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        tokenType: 'Bearer'
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
        return;
      }

      logger.error('Erro ao renovar token', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao renovar token',
        code: 'REFRESH_ERROR'
      });
    }
  }

  /**
   * Logout do usuário
   * POST /api/auth/logout
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.user) {
        // Revoga todos os refresh tokens do usuário
        const revokedCount = jwtService.revokeAllUserTokens(req.user.userId);
        
        logger.info('Logout realizado', {
          userId: req.user.userId,
          tokensRevoked: revokedCount
        });
      }

      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro no logout', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao fazer logout',
        code: 'LOGOUT_ERROR'
      });
    }
  }

  /**
   * Obtém informações do usuário atual
   * GET /api/auth/me
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const user = await userService.getUserById(req.user.userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        }
      });
    } catch (error) {
      logger.error('Erro ao obter usuário atual', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter informações do usuário',
        code: 'GET_USER_ERROR'
      });
    }
  }

  /**
   * Solicita reset de senha
   * POST /api/auth/password/reset-request
   */
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      // Valida dados de entrada
      const validatedData = resetPasswordRequestSchema.parse(req.body);
      
      // Solicita o reset (não revela se o email existe)
      const resetToken = await userService.requestPasswordReset(validatedData.email);
      
      // Em produção, você enviaria o token por email
      // Por enquanto, vamos retorná-lo na resposta (APENAS PARA DESENVOLVIMENTO)
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      res.status(200).json({
        success: true,
        message: 'Se o email existir, instruções de reset foram enviadas',
        ...(isDevelopment && resetToken ? { resetToken } : {})
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
        return;
      }

      logger.error('Erro ao solicitar reset de senha', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao solicitar reset de senha',
        code: 'RESET_REQUEST_ERROR'
      });
    }
  }

  /**
   * Reseta a senha com o token
   * POST /api/auth/password/reset
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Valida dados de entrada
      const validatedData = resetPasswordSchema.parse(req.body);
      
      // Reseta a senha
      await userService.resetPassword(validatedData.token, validatedData.newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Senha resetada com sucesso'
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
        return;
      }

      if (error.message === 'Token inválido' || error.message === 'Token expirado') {
        res.status(400).json({
          success: false,
          error: error.message,
          code: 'INVALID_TOKEN'
        });
        return;
      }

      logger.error('Erro ao resetar senha', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao resetar senha',
        code: 'RESET_ERROR'
      });
    }
  }

  /**
   * Altera a senha do usuário autenticado
   * POST /api/auth/password/change
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      // Valida dados de entrada
      const validatedData = changePasswordSchema.parse(req.body);
      
      // Altera a senha
      await userService.updatePassword(
        req.user.userId,
        validatedData.currentPassword,
        validatedData.newPassword
      );
      
      // Revoga todos os tokens do usuário (força novo login)
      jwtService.revokeAllUserTokens(req.user.userId);
      
      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso. Por favor, faça login novamente.'
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
        return;
      }

      if (error.message === 'Senha atual incorreta') {
        res.status(400).json({
          success: false,
          error: error.message,
          code: 'WRONG_PASSWORD'
        });
        return;
      }

      logger.error('Erro ao alterar senha', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao alterar senha',
        code: 'CHANGE_PASSWORD_ERROR'
      });
    }
  }

  /**
   * Verifica email do usuário
   * GET /api/auth/verify-email/:token
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      
      await userService.verifyEmail(token);
      
      res.status(200).json({
        success: true,
        message: 'Email verificado com sucesso'
      });
    } catch (error: any) {
      if (error.message === 'Token de verificação inválido') {
        res.status(400).json({
          success: false,
          error: error.message,
          code: 'INVALID_TOKEN'
        });
        return;
      }

      logger.error('Erro ao verificar email', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar email',
        code: 'VERIFY_EMAIL_ERROR'
      });
    }
  }

  /**
   * Valida token JWT
   * POST /api/auth/validate
   */
  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = jwtService.extractTokenFromHeader(authHeader);
      
      if (!token) {
        res.status(400).json({
          success: false,
          valid: false,
          error: 'Token não fornecido'
        });
        return;
      }

      const validation = jwtService.validateAccessToken(token);
      
      res.status(200).json({
        success: true,
        valid: validation.valid,
        ...(validation.valid && validation.payload ? {
          user: {
            userId: validation.payload.userId,
            email: validation.payload.email,
            role: validation.payload.role,
            permissions: validation.payload.permissions
          }
        } : {}),
        ...(validation.error ? { error: validation.error } : {})
      });
    } catch (error) {
      logger.error('Erro ao validar token', error);
      res.status(500).json({
        success: false,
        valid: false,
        error: 'Erro ao validar token'
      });
    }
  }
}

// Singleton instance
export const authController = new AuthController();
