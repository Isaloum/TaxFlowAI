import { Router } from 'express';
import { createClient, getClients, getClientById, deleteClient } from '../controllers/accountant.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('accountant'));

router.post('/clients', createClient);
router.get('/clients', getClients);
router.get('/clients/:id', getClientById);
router.delete('/clients/:id', deleteClient);

export default router;
