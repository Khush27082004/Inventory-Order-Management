import express from 'express';
import {
  getStockOverview,
  adjustStock,
  getStockMovements,
  getLowStockAlerts
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getStockOverview);
router.get('/movements', getStockMovements);
router.get('/alerts', getLowStockAlerts);
router.post('/adjust', authorize('admin', 'manager', 'staff'), adjustStock);

export default router;
