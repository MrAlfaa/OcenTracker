import express from 'express';
import { 
  getOverviewReport, 
  getShipmentReport, 
  getUserReport, 
  getDriverReport,
  exportReport
} from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware';

const router = express.Router();

// All report routes should be protected for admins only
router.use(authMiddleware, adminAuthMiddleware);

// Get reports
router.get('/overview', getOverviewReport);
router.get('/shipments', getShipmentReport);
router.get('/users', getUserReport);
router.get('/drivers', getDriverReport);

// Export reports
router.get('/:reportType/export', exportReport);

export default router;