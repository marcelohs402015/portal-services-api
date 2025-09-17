"use strict";
/**
 * Authentication Types
 * Tipos para autenticação JWT e gerenciamento de sessões
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = exports.Permission = exports.UserRole = void 0;
/**
 * Tipos de roles de usuário
 */
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["USER"] = "user";
    UserRole["GUEST"] = "guest";
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * Permissões do sistema
 */
var Permission;
(function (Permission) {
    // Clients
    Permission["CREATE_CLIENT"] = "create_client";
    Permission["READ_CLIENT"] = "read_client";
    Permission["UPDATE_CLIENT"] = "update_client";
    Permission["DELETE_CLIENT"] = "delete_client";
    // Services
    Permission["CREATE_SERVICE"] = "create_service";
    Permission["READ_SERVICE"] = "read_service";
    Permission["UPDATE_SERVICE"] = "update_service";
    Permission["DELETE_SERVICE"] = "delete_service";
    // Quotations
    Permission["CREATE_QUOTATION"] = "create_quotation";
    Permission["READ_QUOTATION"] = "read_quotation";
    Permission["UPDATE_QUOTATION"] = "update_quotation";
    Permission["DELETE_QUOTATION"] = "delete_quotation";
    Permission["APPROVE_QUOTATION"] = "approve_quotation";
    // Appointments
    Permission["CREATE_APPOINTMENT"] = "create_appointment";
    Permission["READ_APPOINTMENT"] = "read_appointment";
    Permission["UPDATE_APPOINTMENT"] = "update_appointment";
    Permission["DELETE_APPOINTMENT"] = "delete_appointment";
    // Categories
    Permission["CREATE_CATEGORY"] = "create_category";
    Permission["READ_CATEGORY"] = "read_category";
    Permission["UPDATE_CATEGORY"] = "update_category";
    Permission["DELETE_CATEGORY"] = "delete_category";
    // Users
    Permission["CREATE_USER"] = "create_user";
    Permission["READ_USER"] = "read_user";
    Permission["UPDATE_USER"] = "update_user";
    Permission["DELETE_USER"] = "delete_user";
    // System
    Permission["ACCESS_ADMIN"] = "access_admin";
    Permission["ACCESS_REPORTS"] = "access_reports";
    Permission["ACCESS_SETTINGS"] = "access_settings";
    Permission["ACCESS_LOGS"] = "access_logs";
    Permission["MANAGE_PERMISSIONS"] = "manage_permissions";
})(Permission || (exports.Permission = Permission = {}));
/**
 * Mapeamento de roles para permissões
 */
exports.RolePermissions = {
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
