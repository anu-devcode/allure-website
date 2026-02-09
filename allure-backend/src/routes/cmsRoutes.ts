import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/cmsController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getSettings);
router.post('/', authenticate, authorizeAdmin, updateSettings);

export default router;
