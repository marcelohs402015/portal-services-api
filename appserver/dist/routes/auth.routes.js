"use strict";
/**
 * Authentication Routes
 * Rotas para autenticação e autorização
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Rotas públicas (sem autenticação)
router.post('/login', AuthController_1.authController.login.bind(AuthController_1.authController));
router.post('/register', AuthController_1.authController.register.bind(AuthController_1.authController));
router.post('/refresh', AuthController_1.authController.refreshToken.bind(AuthController_1.authController));
router.post('/password/reset-request', AuthController_1.authController.requestPasswordReset.bind(AuthController_1.authController));
router.post('/password/reset', AuthController_1.authController.resetPassword.bind(AuthController_1.authController));
router.get('/verify-email/:token', AuthController_1.authController.verifyEmail.bind(AuthController_1.authController));
router.post('/validate', AuthController_1.authController.validateToken.bind(AuthController_1.authController));
// Rotas protegidas (requerem autenticação)
router.use(auth_middleware_1.authenticate); // Aplica autenticação para todas as rotas abaixo
router.use((0, auth_middleware_1.userRateLimit)()); // Aplica rate limiting por usuário
router.post('/logout', AuthController_1.authController.logout.bind(AuthController_1.authController));
router.get('/me', AuthController_1.authController.getCurrentUser.bind(AuthController_1.authController));
router.post('/password/change', AuthController_1.authController.changePassword.bind(AuthController_1.authController));
exports.default = router;
