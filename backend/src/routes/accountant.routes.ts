import { Router } from 'express';
import {
  createClient,
  getClients,
  getClientById,
  deleteClient,
  getDashboardStats,
  getClientsWithTaxYears,
  getClientTaxYears,
  getTaxYearDetails,
  approveDocument,
  rejectDocument,
  downloadTaxPackage,
  markAsComplete
} from '../controllers/accountant.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('accountant'));

// Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Client management
router.post('/clients', createClient);
router.get('/clients', getClients);
router.get('/clients-with-tax-years', getClientsWithTaxYears);
router.get('/clients/:id', getClientById);
router.delete('/clients/:id', deleteClient);

// Tax year management
router.get('/clients/:clientId/years', getClientTaxYears);
router.get('/tax-years/:taxYearId', getTaxYearDetails);
router.get('/tax-years/:taxYearId/download-package', downloadTaxPackage);
router.post('/tax-years/:taxYearId/complete', markAsComplete);

// Document review
router.post('/documents/:documentId/approve', approveDocument);
router.post('/documents/:documentId/reject', rejectDocument);

export default router;
