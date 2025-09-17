/**
 * User Service
 * Serviço para gerenciamento de usuários e autenticação
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { 
  User, 
  UserRole, 
  LoginCredentials,
  Permission,
  RolePermissions,
  SecurityOptions
} from '../types/auth.types';
import { createLogger } from '../shared/logger';

export class UserService {
  private users: Map<string, User> = new Map();
  private emailToUserId: Map<string, string> = new Map();
  private loginAttempts: Map<string, { count: number; lockedUntil?: Date }> = new Map();
  private logger = createLogger('user-service');
  private securityOptions: SecurityOptions;

  constructor() {
    this.securityOptions = this.loadSecurityOptions();
    this.initializeDefaultUsers();
  }

  /**
   * Carrega opções de segurança
   */
  private loadSecurityOptions(): SecurityOptions {
    return {
      requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
      enableTwoFactor: process.env.ENABLE_TWO_FACTOR === 'true',
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30'),
      passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
      passwordRequireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
      passwordRequireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
      passwordRequireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
      passwordRequireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '60'),
      allowMultipleSessions: process.env.ALLOW_MULTIPLE_SESSIONS !== 'false'
    };
  }

  /**
   * Inicializa usuários padrão para desenvolvimento
   */
  private async initializeDefaultUsers(): Promise<void> {
    // Super Admin
    await this.createUser({
      email: 'admin@portalservices.com',
      password: 'Admin@123456',
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN
    });

    // Admin
    await this.createUser({
      email: 'manager@portalservices.com',
      password: 'Manager@123456',
      name: 'Manager User',
      role: UserRole.MANAGER
    });

    // User comum
    await this.createUser({
      email: 'user@portalservices.com',
      password: 'User@123456',
      name: 'Regular User',
      role: UserRole.USER
    });

    // Guest
    await this.createUser({
      email: 'guest@portalservices.com',
      password: 'Guest@123456',
      name: 'Guest User',
      role: UserRole.GUEST
    });

    this.logger.info('Usuários padrão inicializados');
  }

  /**
   * Cria um novo usuário
   */
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    permissions?: Permission[];
  }): Promise<User> {
    // Valida se o email já existe
    if (this.emailToUserId.has(data.email.toLowerCase())) {
      throw new Error('Email já cadastrado');
    }

    // Valida a senha
    this.validatePassword(data.password);

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Cria o usuário
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name,
      role: data.role,
      permissions: data.permissions || RolePermissions[data.role],
      isActive: true,
      emailVerified: !this.securityOptions.requireEmailVerification,
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false
    };

    // Se requer verificação de email, gera token
    if (this.securityOptions.requireEmailVerification && !user.emailVerified) {
      user.emailVerificationToken = crypto.randomBytes(32).toString('hex');
    }

    // Armazena o usuário
    this.users.set(user.id, user);
    this.emailToUserId.set(user.email, user.id);

    this.logger.info('Novo usuário criado', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return this.sanitizeUser(user);
  }

  /**
   * Valida requisitos de senha
   */
  private validatePassword(password: string): void {
    const errors: string[] = [];

    if (password.length < this.securityOptions.passwordMinLength) {
      errors.push(`A senha deve ter pelo menos ${this.securityOptions.passwordMinLength} caracteres`);
    }

    if (this.securityOptions.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }

    if (this.securityOptions.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }

    if (this.securityOptions.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }

    if (this.securityOptions.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial');
    }

    if (errors.length > 0) {
      throw new Error(`Senha inválida: ${errors.join(', ')}`);
    }
  }

  /**
   * Autentica um usuário
   */
  async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    const email = credentials.email.toLowerCase();
    
    // Verifica se a conta está bloqueada
    const attempts = this.loginAttempts.get(email);
    if (attempts?.lockedUntil && attempts.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil((attempts.lockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(`Conta bloqueada. Tente novamente em ${minutesRemaining} minutos.`);
    }

    // Busca o usuário
    const userId = this.emailToUserId.get(email);
    if (!userId) {
      this.recordFailedLogin(email);
      return null;
    }

    const user = this.users.get(userId);
    if (!user) {
      this.recordFailedLogin(email);
      return null;
    }

    // Verifica se o usuário está ativo
    if (!user.isActive) {
      throw new Error('Conta desativada');
    }

    // Verifica se o email foi verificado
    if (this.securityOptions.requireEmailVerification && !user.emailVerified) {
      throw new Error('Email não verificado. Por favor, verifique seu email.');
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      this.recordFailedLogin(email);
      return null;
    }

    // Limpa tentativas de login
    this.loginAttempts.delete(email);

    // Atualiza último login
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();

    this.logger.info('Usuário autenticado com sucesso', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return this.sanitizeUser(user);
  }

  /**
   * Registra tentativa de login falhada
   */
  private recordFailedLogin(email: string): void {
    const attempts = this.loginAttempts.get(email) || { count: 0 };
    attempts.count++;

    if (attempts.count >= this.securityOptions.maxLoginAttempts) {
      const lockoutMs = this.securityOptions.lockoutDuration * 60 * 1000;
      attempts.lockedUntil = new Date(Date.now() + lockoutMs);
      
      this.logger.warn('Conta bloqueada por múltiplas tentativas de login', {
        email,
        attempts: attempts.count,
        lockedUntil: attempts.lockedUntil
      });
    }

    this.loginAttempts.set(email, attempts);
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Busca usuário por email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const userId = this.emailToUserId.get(email.toLowerCase());
    if (!userId) return null;
    
    const user = this.users.get(userId);
    return user ? this.sanitizeUser(user) : null;
  }

  /**
   * Atualiza senha do usuário
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verifica a senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Valida a nova senha
    this.validatePassword(newPassword);

    // Atualiza a senha
    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();

    this.logger.info('Senha atualizada', { userId });
  }

  /**
   * Solicita reset de senha
   */
  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Não revelamos se o email existe ou não
      return '';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Token válido por 1 hora

    const fullUser = this.users.get(user.id)!;
    fullUser.passwordResetToken = resetToken;
    fullUser.passwordResetExpires = expiry;

    this.logger.info('Reset de senha solicitado', {
      userId: user.id,
      email: user.email
    });

    return resetToken;
  }

  /**
   * Reseta a senha usando o token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Busca usuário pelo token
    let userFound: User | null = null;
    
    for (const user of this.users.values()) {
      if (user.passwordResetToken === token) {
        userFound = user;
        break;
      }
    }

    if (!userFound) {
      throw new Error('Token inválido');
    }

    if (!userFound.passwordResetExpires || userFound.passwordResetExpires < new Date()) {
      throw new Error('Token expirado');
    }

    // Valida e atualiza a senha
    this.validatePassword(newPassword);
    userFound.password = await bcrypt.hash(newPassword, 10);
    userFound.passwordResetToken = undefined;
    userFound.passwordResetExpires = undefined;
    userFound.updatedAt = new Date();

    this.logger.info('Senha resetada com sucesso', { userId: userFound.id });
  }

  /**
   * Verifica email do usuário
   */
  async verifyEmail(token: string): Promise<void> {
    let userFound: User | null = null;
    
    for (const user of this.users.values()) {
      if (user.emailVerificationToken === token) {
        userFound = user;
        break;
      }
    }

    if (!userFound) {
      throw new Error('Token de verificação inválido');
    }

    userFound.emailVerified = true;
    userFound.emailVerificationToken = undefined;
    userFound.updatedAt = new Date();

    this.logger.info('Email verificado', {
      userId: userFound.id,
      email: userFound.email
    });
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Campos que podem ser atualizados
    const allowedFields = ['name', 'email'];
    
    for (const field of allowedFields) {
      if (data[field as keyof User] !== undefined) {
        (user as any)[field] = data[field as keyof User];
      }
    }

    // Se o email foi alterado, atualiza o mapeamento
    if (data.email && data.email !== user.email) {
      this.emailToUserId.delete(user.email);
      this.emailToUserId.set(data.email.toLowerCase(), userId);
      user.email = data.email.toLowerCase();
      user.emailVerified = false;
      user.emailVerificationToken = crypto.randomBytes(32).toString('hex');
    }

    user.updatedAt = new Date();

    this.logger.info('Perfil atualizado', {
      userId,
      updatedFields: Object.keys(data)
    });

    return this.sanitizeUser(user);
  }

  /**
   * Ativa/desativa usuário
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    user.isActive = isActive;
    user.updatedAt = new Date();

    this.logger.info('Status do usuário alterado', {
      userId,
      isActive
    });
  }

  /**
   * Lista todos os usuários
   */
  async listUsers(filters?: {
    role?: UserRole;
    isActive?: boolean;
    emailVerified?: boolean;
  }): Promise<User[]> {
    let users = Array.from(this.users.values());

    if (filters) {
      if (filters.role !== undefined) {
        users = users.filter(u => u.role === filters.role);
      }
      if (filters.isActive !== undefined) {
        users = users.filter(u => u.isActive === filters.isActive);
      }
      if (filters.emailVerified !== undefined) {
        users = users.filter(u => u.emailVerified === filters.emailVerified);
      }
    }

    return users.map(u => this.sanitizeUser(u));
  }

  /**
   * Remove campos sensíveis do usuário
   */
  private sanitizeUser(user: User): User {
    const sanitized = { ...user };
    delete (sanitized as any).password;
    delete sanitized.passwordResetToken;
    delete sanitized.passwordResetExpires;
    delete sanitized.emailVerificationToken;
    delete sanitized.twoFactorSecret;
    return sanitized;
  }

  /**
   * Deleta um usuário
   */
  async deleteUser(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    this.users.delete(userId);
    this.emailToUserId.delete(user.email);

    this.logger.info('Usuário deletado', { userId });
  }
}

// Singleton instance
export const userService = new UserService();
