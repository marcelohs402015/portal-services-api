/**
 * Authentication Types
 * Tipos para autenticação JWT e gerenciamento de sessões
 */

import { Request } from 'express';

/**
 * Payload do JWT Token
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions?: string[];
  iat?: number;
  exp?: number;
  jti?: string; // JWT ID único para tracking
}

/**
 * Tipos de roles de usuário
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest'
}

/**
 * Token de refresh
 */
export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Request autenticada
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  token?: string;
}

/**
 * Credenciais de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Resposta de autenticação
 */
export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    permissions?: string[];
  };
}

/**
 * Opções de configuração JWT
 */
export interface JWTConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string; // ex: '15m', '1h'
  refreshTokenExpiry: string; // ex: '7d', '30d'
  issuer: string;
  audience: string;
}

/**
 * Permissões do sistema
 */
export enum Permission {
  // Clients
  CREATE_CLIENT = 'create_client',
  READ_CLIENT = 'read_client',
  UPDATE_CLIENT = 'update_client',
  DELETE_CLIENT = 'delete_client',
  
  // Services
  CREATE_SERVICE = 'create_service',
  READ_SERVICE = 'read_service',
  UPDATE_SERVICE = 'update_service',
  DELETE_SERVICE = 'delete_service',
  
  // Quotations
  CREATE_QUOTATION = 'create_quotation',
  READ_QUOTATION = 'read_quotation',
  UPDATE_QUOTATION = 'update_quotation',
  DELETE_QUOTATION = 'delete_quotation',
  APPROVE_QUOTATION = 'approve_quotation',
  
  // Appointments
  CREATE_APPOINTMENT = 'create_appointment',
  READ_APPOINTMENT = 'read_appointment',
  UPDATE_APPOINTMENT = 'update_appointment',
  DELETE_APPOINTMENT = 'delete_appointment',
  
  // Categories
  CREATE_CATEGORY = 'create_category',
  READ_CATEGORY = 'read_category',
  UPDATE_CATEGORY = 'update_category',
  DELETE_CATEGORY = 'delete_category',
  
  // Users
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  
  // System
  ACCESS_ADMIN = 'access_admin',
  ACCESS_REPORTS = 'access_reports',
  ACCESS_SETTINGS = 'access_settings',
  ACCESS_LOGS = 'access_logs',
  MANAGE_PERMISSIONS = 'manage_permissions'
}

/**
 * Mapeamento de roles para permissões
 */
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission), // Todas as permissões
  
  [UserRole.ADMIN]: [
    // Todas exceto gerenciamento de permissões
    ...Object.values(Permission).filter(p => p !== Permission.MANAGE_PERMISSIONS)
  ],
  
  [UserRole.MANAGER]: [
    // CRUD completo exceto users e system
    Permission.CREATE_CLIENT, Permission.READ_CLIENT, Permission.UPDATE_CLIENT,
    Permission.CREATE_SERVICE, Permission.READ_SERVICE, Permission.UPDATE_SERVICE,
    Permission.CREATE_QUOTATION, Permission.READ_QUOTATION, Permission.UPDATE_QUOTATION,
    Permission.APPROVE_QUOTATION,
    Permission.CREATE_APPOINTMENT, Permission.READ_APPOINTMENT, Permission.UPDATE_APPOINTMENT,
    Permission.READ_CATEGORY,
    Permission.ACCESS_REPORTS
  ],
  
  [UserRole.USER]: [
    // Apenas leitura e criação básica
    Permission.READ_CLIENT,
    Permission.READ_SERVICE,
    Permission.CREATE_QUOTATION, Permission.READ_QUOTATION,
    Permission.CREATE_APPOINTMENT, Permission.READ_APPOINTMENT,
    Permission.READ_CATEGORY
  ],
  
  [UserRole.GUEST]: [
    // Apenas leitura limitada
    Permission.READ_SERVICE,
    Permission.READ_CATEGORY
  ]
};

/**
 * Interface de usuário
 */
export interface User {
  id: string;
  email: string;
  password: string; // hash
  name: string;
  role: UserRole;
  permissions?: Permission[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
}

/**
 * Resultado de validação de token
 */
export interface TokenValidationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
  expired?: boolean;
}

/**
 * Opções de segurança
 */
export interface SecurityOptions {
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // em minutos
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  sessionTimeout: number; // em minutos
  allowMultipleSessions: boolean;
}
