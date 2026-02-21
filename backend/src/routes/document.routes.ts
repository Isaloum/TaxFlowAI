import express from 'express';
import rateLimit from 'express-rate-limit';
import { DocumentController } from '../controllers/document.controller';
import { authenticateToken, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Rate limiter for file uploads - prevent abuse
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 minutes per client
  message: { error: 'Too many upload requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for document operations
const documentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// All routes require authentication with client role
router.use(authenticateToken);
router.use(requireRole('client'));
router.use(documentLimiter);

// Presigned upload flow (no binary through API Gateway)
router.post('/tax-years/:year/presign', DocumentController.presignUpload);
router.post('/documents/:documentId/confirm', DocumentController.confirmUpload);

router.post(
  '/tax-years/:year/documents',
  uploadLimiter,
  upload.single('file'),
  DocumentController.uploadDocument
);

router.get(
  '/tax-years/:year/documents',
  DocumentController.listDocuments
);

router.delete(
  '/documents/:id',
  DocumentController.deleteDocument
);

router.get(
  '/documents/:id/download',
  DocumentController.downloadDocument
);

router.post(
  '/documents/:id/extract',
  DocumentController.triggerExtraction
);

export default router;
