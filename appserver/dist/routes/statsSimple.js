"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatsRoutesSimple = void 0;
const express_1 = __importDefault(require("express"));
function createStatsRoutesSimple(db) {
    const router = express_1.default.Router();
    // Get business statistics overview
    router.get('/stats/business', async (req, res) => {
        try {
            // Total clients
            const clientsResult = await db.query('SELECT COUNT(*) as count FROM clients');
            const totalClients = parseInt(clientsResult.rows[0].count);
            // Total quotations and revenue
            const quotationsResult = await db.query(`
        SELECT 
          COUNT(*) as total_quotations,
          COALESCE(SUM(total), 0) as total_revenue,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotations,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_quotations,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_quotations
        FROM quotations
      `);
            const quotationStats = quotationsResult.rows[0];
            // Total appointments
            const appointmentsResult = await db.query(`
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
        FROM appointments
      `);
            const appointmentStats = appointmentsResult.rows[0];
            // Total services
            const servicesResult = await db.query('SELECT COUNT(*) as count FROM services WHERE active = true');
            const totalServices = parseInt(servicesResult.rows[0].count);
            // Email statistics
            const emailsResult = await db.query(`
        SELECT 
          COUNT(*) as total_emails,
          COUNT(CASE WHEN processed = true THEN 1 END) as processed_emails,
          COUNT(CASE WHEN responded = true THEN 1 END) as responded_emails
        FROM emails
      `);
            const emailStats = emailsResult.rows[0];
            // Monthly revenue trend (last 6 months)
            const monthlyRevenueResult = await db.query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as quotations_count
        FROM quotations 
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `);
            // Service category distribution
            const categoryStatsResult = await db.query(`
        SELECT 
          s.category,
          COUNT(DISTINCT s.id) as service_count,
          COUNT(DISTINCT q.id) as quotations_count,
          COALESCE(SUM(q.total), 0) as total_revenue
        FROM services s
        LEFT JOIN quotations q ON q.services::text LIKE '%' || s.id || '%'
        WHERE s.active = true
        GROUP BY s.category
        ORDER BY total_revenue DESC
      `);
            const businessStats = {
                overview: {
                    totalClients: totalClients,
                    totalQuotations: parseInt(quotationStats.total_quotations),
                    totalRevenue: parseFloat(quotationStats.total_revenue),
                    totalAppointments: parseInt(appointmentStats.total_appointments),
                    totalServices: totalServices,
                    totalEmails: parseInt(emailStats.total_emails)
                },
                quotations: {
                    total: parseInt(quotationStats.total_quotations),
                    accepted: parseInt(quotationStats.accepted_quotations),
                    pending: parseInt(quotationStats.pending_quotations),
                    rejected: parseInt(quotationStats.rejected_quotations),
                    totalRevenue: parseFloat(quotationStats.total_revenue)
                },
                appointments: {
                    total: parseInt(appointmentStats.total_appointments),
                    scheduled: parseInt(appointmentStats.scheduled),
                    confirmed: parseInt(appointmentStats.confirmed),
                    completed: parseInt(appointmentStats.completed),
                    cancelled: parseInt(appointmentStats.cancelled)
                },
                emails: {
                    total: parseInt(emailStats.total_emails),
                    processed: parseInt(emailStats.processed_emails),
                    responded: parseInt(emailStats.responded_emails),
                    responseRate: emailStats.total_emails > 0
                        ? ((parseInt(emailStats.responded_emails) / parseInt(emailStats.total_emails)) * 100).toFixed(1)
                        : '0'
                },
                monthlyRevenue: monthlyRevenueResult.rows,
                categoryStats: categoryStatsResult.rows
            };
            return res.json({ success: true, data: businessStats });
        }
        catch (error) {
            console.error('Failed to get business stats:', error);
            return res.status(500).json({ success: false, error: 'Failed to get business stats' });
        }
    });
    return router;
}
exports.createStatsRoutesSimple = createStatsRoutesSimple;
