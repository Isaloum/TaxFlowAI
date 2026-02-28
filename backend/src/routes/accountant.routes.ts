import { Router } from 'express';
import {
  createClient,
  getClients,
  getClientById,
  deleteClient,
  resendInvitation,
  getDashboardStats,
  getClientsWithTaxYears,
  getClientTaxYears,
  getTaxYearDetails,
  approveDocument,
  rejectDocument,
  getDocumentDownload,
  resetDocument,
  rescanDocument,
  downloadTaxPackage,
  markAsComplete,
  reopenTaxYear,
  forceSubmitTaxYear,
  updateTaxYearNotes,
  createTaxYear,
  exportTaxYearExcel,
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
router.post('/clients/:id/resend-invitation', resendInvitation);

// Tax year management
router.post('/clients/:clientId/tax-years', createTaxYear);
router.get('/clients/:clientId/years', getClientTaxYears);
router.get('/tax-years/:taxYearId/export-excel', exportTaxYearExcel);
router.get('/tax-years/:taxYearId', getTaxYearDetails);
router.get('/tax-years/:taxYearId/download-package', downloadTaxPackage);
router.post('/tax-years/:taxYearId/complete', markAsComplete);
router.post('/tax-years/:taxYearId/reopen', reopenTaxYear);
router.post('/tax-years/:taxYearId/force-submit', forceSubmitTaxYear);
router.patch('/tax-years/:taxYearId/notes', updateTaxYearNotes);

// Document review
router.post('/documents/:documentId/approve', approveDocument);
router.post('/documents/:documentId/reject', rejectDocument);
router.post('/documents/:documentId/reset', resetDocument);
router.post('/documents/:documentId/rescan', rescanDocument);
router.get('/documents/:documentId/download', getDocumentDownload);

export default router;
