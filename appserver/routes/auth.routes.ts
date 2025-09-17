/**
 * Authentication Routes
 * Rotas para autenticação e autorização
 */

import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authenticate, userRateLimit } from '../middlewares/auth.middleware';

const router = Router();

// Rotas públicas (sem autenticação)
router.post('/login', authController.login.bind(authController));
router.post('/register', authController.register.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/password/reset-request', authController.requestPasswordReset.bind(authController));
router.post('/password/reset', authController.resetPassword.bind(authController));
router.get('/verify-email/:token', authController.verifyEmail.bind(authController));
router.post('/validate', authController.validateToken.bind(authController));

// Rotas protegidas (requerem autenticação)
router.use(authenticate); // Aplica autenticação para todas as rotas abaixo
router.use(userRateLimit()); // Aplica rate limiting por usuário

router.post('/logout', authController.logout.bind(authController));
router.get('/me', authController.getCurrentUser.bind(authController));
router.post('/password/change', authController.changePassword.bind(authController));

export default router;
