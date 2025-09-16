"use strict";
// =====================================================
// Portal Services - Service Controller
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const ServiceService_js_1 = require("../services/ServiceService.js");
const logger_js_1 = require("../shared/logger.js");
class ServiceController {
    constructor(db) {
        // GET /api/services
        this.getAllServices = async (req, res) => {
            try {
                const params = {
                    page: req.query.page ? parseInt(req.query.page) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                    offset: req.query.offset ? parseInt(req.query.offset) : undefined,
                    sort_by: req.query.sort_by,
                    sort_order: req.query.sort_order,
                    search: req.query.search,
                    active: req.query.active ? req.query.active === 'true' : undefined,
                    category_id: req.query.category_id
                };
                const result = await this.service.getAllServices(params);
                if (result.success) {
                    res.json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in getAllServices controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // GET /api/services/active
        this.getActiveServices = async (req, res) => {
            try {
                const result = await this.service.getActiveServices();
                if (result.success) {
                    res.json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in getActiveServices controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // GET /api/services/category/:categoryId
        this.getServicesByCategory = async (req, res) => {
            try {
                const { categoryId } = req.params;
                const result = await this.service.getServicesByCategory(categoryId);
                if (result.success) {
                    res.json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in getServicesByCategory controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // GET /api/services/requiring-quote
        this.getServicesRequiringQuote = async (req, res) => {
            try {
                const result = await this.service.getServicesRequiringQuote();
                if (result.success) {
                    res.json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in getServicesRequiringQuote controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // GET /api/services/search
        this.searchServices = async (req, res) => {
            try {
                const { q: searchTerm, limit } = req.query;
                if (!searchTerm || typeof searchTerm !== 'string') {
                    res.status(400).json({
                        success: false,
                        error: 'Parâmetro de busca é obrigatório'
                    });
                    return;
                }
                const result = await this.service.searchServices(searchTerm, limit ? parseInt(limit) : 10);
                if (result.success) {
                    res.json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in searchServices controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // GET /api/services/:id
        this.getServiceById = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.service.getServiceById(id);
                if (result.success) {
                    if (result.data) {
                        res.json(result);
                    }
                    else {
                        res.status(404).json({
                            success: false,
                            error: 'Serviço não encontrado'
                        });
                    }
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in getServiceById controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // POST /api/services
        this.createService = async (req, res) => {
            try {
                const result = await this.service.createService(req.body);
                if (result.success) {
                    res.status(201).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in createService controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // PUT /api/services/:id
        this.updateService = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.service.updateService(id, req.body);
                if (result.success) {
                    if (result.data) {
                        res.json(result);
                    }
                    else {
                        res.status(404).json({
                            success: false,
                            error: 'Serviço não encontrado'
                        });
                    }
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in updateService controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // DELETE /api/services/:id
        this.deleteService = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.service.deleteService(id);
                if (result.success) {
                    res.json({
                        success: true,
                        message: 'Serviço excluído com sucesso'
                    });
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in deleteService controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // PATCH /api/services/:id/soft-delete
        this.softDeleteService = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.service.softDeleteService(id);
                if (result.success) {
                    if (result.data) {
                        res.json({
                            success: true,
                            message: 'Serviço desativado com sucesso',
                            data: result.data
                        });
                    }
                    else {
                        res.status(404).json({
                            success: false,
                            error: 'Serviço não encontrado'
                        });
                    }
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in softDeleteService controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        // GET /api/services/stats
        this.getServiceStats = async (req, res) => {
            try {
                const result = await this.service.getServiceStats();
                if (result.success) {
                    res.json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                this.logger.error('Error in getServiceStats controller:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        };
        this.service = new ServiceService_js_1.ServiceService(db);
        this.logger = (0, logger_js_1.createLogger)('ServiceController');
    }
}
exports.ServiceController = ServiceController;
