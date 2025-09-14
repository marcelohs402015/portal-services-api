// =====================================================
// Portal Services - API Routes Index
// =====================================================
import { Router } from 'express';
import { createCategoryRoutes } from '../categories.js';
import { createServiceRoutes } from '../services.js';
import { createClientRoutes } from '../clients.js';
import { createQuotationsRoutesReal } from '../quotationsRoutes.real.js';
import { createAppointmentsRoutesReal } from '../appointmentsRoutes.real.js';
import { createEmailRoutesReal } from '../emailRoutes.real.js';
import { createStatsRoutesSimple } from '../statsSimple.js';
import { createLogger } from '../../shared/logger.js';
export function createAPIRoutes(db) {
    const router = Router();
    const logger = createLogger('APIRoutes');
    logger.info('Setting up API routes');
    // Health check
    router.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'API funcionando!',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    });
    // Mount entity routes
    router.use('/categories', createCategoryRoutes(db));
    router.use('/services', createServiceRoutes(db));
    router.use('/clients', createClientRoutes(db));
    router.use('/', createQuotationsRoutesReal(db));
    router.use('/', createAppointmentsRoutesReal(db));
    router.use('/', createEmailRoutesReal(db));
    router.use('/', createStatsRoutesSimple(db));
    return router;
}
//# sourceMappingURL=index.js.map