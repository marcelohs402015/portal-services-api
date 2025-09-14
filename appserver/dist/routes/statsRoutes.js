import { Router } from 'express';
export function createStatsRoutes(db) {
    const router = Router();
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
            // Service category distribution - simplified approach counting all quotations by category
            const categoryStatsResult = await db.query(`
        SELECT
          cat.name as category,
          COUNT(DISTINCT s.id) as service_count,
          (SELECT COUNT(*) FROM quotations WHERE total > 0) as quotations_count,
          (SELECT COALESCE(SUM(total), 0) FROM quotations WHERE total > 0) as total_revenue
        FROM categories cat
        LEFT JOIN services s ON s.category = cat.name AND s.active = true
        GROUP BY cat.name
        HAVING COUNT(DISTINCT s.id) > 0
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
    // Get revenue statistics by period
    router.get('/stats/revenue/:period?', async (req, res) => {
        try {
            const period = req.params.period || 'monthly';
            let dateFormat = 'month';
            let interval = '12 months';
            switch (period) {
                case 'daily':
                    dateFormat = 'day';
                    interval = '30 days';
                    break;
                case 'weekly':
                    dateFormat = 'week';
                    interval = '12 weeks';
                    break;
                case 'yearly':
                    dateFormat = 'year';
                    interval = '5 years';
                    break;
                default:
                    dateFormat = 'month';
                    interval = '12 months';
            }
            const revenueResult = await db.query(`
        SELECT 
          DATE_TRUNC('${dateFormat}', created_at) as period,
          COALESCE(SUM(total), 0) as revenue,
          COUNT(*) as quotations_count,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count
        FROM quotations 
        WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
        GROUP BY DATE_TRUNC('${dateFormat}', created_at)
        ORDER BY period ASC
      `);
            // Calculate growth rate
            const revenueData = revenueResult.rows.map((row, index, array) => {
                let growthRate = 0;
                if (index > 0 && array[index - 1].revenue > 0) {
                    growthRate = ((row.revenue - array[index - 1].revenue) / array[index - 1].revenue) * 100;
                }
                return {
                    ...row,
                    revenue: parseFloat(row.revenue),
                    quotations_count: parseInt(row.quotations_count),
                    accepted_count: parseInt(row.accepted_count),
                    growth_rate: parseFloat(growthRate.toFixed(2))
                };
            });
            return res.json({ success: true, data: revenueData });
        }
        catch (error) {
            console.error('Failed to get revenue stats:', error);
            return res.status(500).json({ success: false, error: 'Failed to get revenue stats' });
        }
    });
    // Get appointment statistics
    router.get('/stats/appointments', async (req, res) => {
        try {
            // Appointment status distribution
            const statusResult = await db.query(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentage
        FROM appointments
        GROUP BY status
        ORDER BY count DESC
      `);
            // Daily appointment trends (last 30 days)
            const dailyTrendResult = await db.query(`
        SELECT 
          date,
          COUNT(*) as appointments_count,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
        FROM appointments
        WHERE date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY date
        ORDER BY date ASC
      `);
            // Most requested services
            const servicesResult = await db.query(`
        SELECT 
          jsonb_array_elements_text(service_names) as service_name,
          COUNT(*) as request_count
        FROM appointments
        WHERE service_names IS NOT NULL
        GROUP BY jsonb_array_elements_text(service_names)
        ORDER BY request_count DESC
        LIMIT 10
      `);
            return res.json({
                success: true,
                data: {
                    statusDistribution: statusResult.rows,
                    dailyTrend: dailyTrendResult.rows,
                    topServices: servicesResult.rows
                }
            });
        }
        catch (error) {
            console.error('Failed to get appointment stats:', error);
            return res.status(500).json({ success: false, error: 'Failed to get appointment stats' });
        }
    });
    // Get client statistics
    router.get('/stats/clients', async (req, res) => {
        try {
            // Client growth over time
            const growthResult = await db.query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as new_clients,
          SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as total_clients
        FROM clients
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
      `);
            // Top clients by quotations
            const topClientsResult = await db.query(`
        SELECT 
          c.name,
          c.email,
          COUNT(q.id) as quotations_count,
          COALESCE(SUM(q.total), 0) as total_spent,
          COUNT(a.id) as appointments_count
        FROM clients c
        LEFT JOIN quotations q ON q.client_email = c.email
        LEFT JOIN appointments a ON a.client_id::text = c.id::text
        GROUP BY c.id, c.name, c.email
        HAVING COUNT(q.id) > 0 OR COUNT(a.id) > 0
        ORDER BY total_spent DESC, quotations_count DESC
        LIMIT 10
      `);
            return res.json({
                success: true,
                data: {
                    growth: growthResult.rows,
                    topClients: topClientsResult.rows.map(row => ({
                        ...row,
                        total_spent: parseFloat(row.total_spent),
                        quotations_count: parseInt(row.quotations_count),
                        appointments_count: parseInt(row.appointments_count)
                    }))
                }
            });
        }
        catch (error) {
            console.error('Failed to get client stats:', error);
            return res.status(500).json({ success: false, error: 'Failed to get client stats' });
        }
    });
    return router;
}
//# sourceMappingURL=statsRoutes.js.map