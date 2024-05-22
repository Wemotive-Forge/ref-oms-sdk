// routes/sellerRoutes.js
import {Router} from 'express';
const router = new Router();
import {settlementController} from "../controllers";

router.post('/settlement', settlementController.createSettlementDetails);
router.get('/settlement', settlementController.getAllSettlementDetails);
router.get('/settlement/:id', settlementController.getSettlementById);
router.get('/settlement/download/xlsx', settlementController.exportToExcel);

export default router;
