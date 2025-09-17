"use strict";
/**
 * Authentication Controller
 * Controller para gerenciar autenticação e autorização
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const zod_1 = require("zod");
const UserService_1 = require("../services/UserService");
const JWTService_1 = require("../services/JWTService");
const logger_1 = require("../shared/logger");
const logger = (0, logger_1.createLogger)('auth-controller');
// Schemas de validação
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    rememberMe: zod_1.z.boolean().optional()
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    role: zod_1.z.enum(['user', 'guest']).optional() // Apenas roles básicas para auto-registro
});
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string()
});
const resetPasswordRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido')
});
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
});
class AuthController {
    /**
     * Login de usuário
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            // Valida dados de entrada
            const validatedData = loginSchema.parse(req.body);
            // Autentica o usuário
            const user = await UserService_1.userService.authenticateUser(validatedData);
            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'Credenciais inválidas',
                    code: 'INVALID_CREDENTIALS'
                });
                return;
            }
            // Gera tokens
            const accessToken = JWTService_1.jwtService.generateAccessToken({
                userId: user.id,
                email: user.email,
                role: user.role,
                permissions: user.permissions
            });
            const refreshToken = JWTService_1.jwtService.generateRefreshToken(user.id, req.headers['user-agent'], req.ip);
            // Calcula expiração
            const expiresIn = validatedData.rememberMe ? 7 * 24 * 60 * 60 : 15 * 60; // 7 dias ou 15 minutos
            // Resposta de sucesso
            const response = {
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
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    async register(req, res) {
        try {
            // Valida dados de entrada
            const validatedData = registerSchema.parse(req.body);
            // Cria o usuário
            const user = await UserService_1.userService.createUser({
                email: validatedData.email,
                password: validatedData.password,
                name: validatedData.name,
                role: validatedData.role || 'user'
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
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    async refreshToken(req, res) {
        try {
            // Valida dados de entrada
            const validatedData = refreshTokenSchema.parse(req.body);
            // Renova o access token
            const newAccessToken = await JWTService_1.jwtService.refreshAccessToken(validatedData.refreshToken);
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
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    async logout(req, res) {
        try {
            if (req.user) {
                // Revoga todos os refresh tokens do usuário
                const revokedCount = JWTService_1.jwtService.revokeAllUserTokens(req.user.userId);
                logger.info('Logout realizado', {
                    userId: req.user.userId,
                    tokensRevoked: revokedCount
                });
            }
            res.status(200).json({
                success: true,
                message: 'Logout realizado com sucesso'
            });
        }
        catch (error) {
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
    async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Não autenticado',
                    code: 'NOT_AUTHENTICATED'
                });
                return;
            }
            const user = await UserService_1.userService.getUserById(req.user.userId);
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
        }
        catch (error) {
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
    async requestPasswordReset(req, res) {
        try {
            // Valida dados de entrada
            const validatedData = resetPasswordRequestSchema.parse(req.body);
            // Solicita o reset (não revela se o email existe)
            const resetToken = await UserService_1.userService.requestPasswordReset(validatedData.email);
            // Em produção, você enviaria o token por email
            // Por enquanto, vamos retorná-lo na resposta (APENAS PARA DESENVOLVIMENTO)
            const isDevelopment = process.env.NODE_ENV === 'development';
            res.status(200).json({
                success: true,
                message: 'Se o email existir, instruções de reset foram enviadas',
                ...(isDevelopment && resetToken ? { resetToken } : {})
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    async resetPassword(req, res) {
        try {
            // Valida dados de entrada
            const validatedData = resetPasswordSchema.parse(req.body);
            // Reseta a senha
            await UserService_1.userService.resetPassword(validatedData.token, validatedData.newPassword);
            res.status(200).json({
                success: true,
                message: 'Senha resetada com sucesso'
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    async changePassword(req, res) {
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
            await UserService_1.userService.updatePassword(req.user.userId, validatedData.currentPassword, validatedData.newPassword);
            // Revoga todos os tokens do usuário (força novo login)
            JWTService_1.jwtService.revokeAllUserTokens(req.user.userId);
            res.status(200).json({
                success: true,
                message: 'Senha alterada com sucesso. Por favor, faça login novamente.'
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    async verifyEmail(req, res) {
        try {
            const { token } = req.params;
            await UserService_1.userService.verifyEmail(token);
            res.status(200).json({
                success: true,
                message: 'Email verificado com sucesso'
            });
        }
        catch (error) {
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
    async validateToken(req, res) {
        try {
            const authHeader = req.headers.authorization;
            const token = JWTService_1.jwtService.extractTokenFromHeader(authHeader);
            if (!token) {
                res.status(400).json({
                    success: false,
                    valid: false,
                    error: 'Token não fornecido'
                });
                return;
            }
            const validation = JWTService_1.jwtService.validateAccessToken(token);
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
        }
        catch (error) {
            logger.error('Erro ao validar token', error);
            res.status(500).json({
                success: false,
                valid: false,
                error: 'Erro ao validar token'
            });
        }
    }
}
exports.AuthController = AuthController;
// Singleton instance
exports.authController = new AuthController();
