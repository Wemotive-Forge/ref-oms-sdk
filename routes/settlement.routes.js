// routes/sellerRoutes.js
import {Router} from 'express';
const router = new Router();
import {settlementController} from "../controllers";
import {auth} from "../middlewares/authentication";

router.post('/settlement',auth(), settlementController.createSettlementDetails);
router.get('/settlement', auth(),settlementController.getAllSettlementDetails);
router.get('/settlement/:id',auth(), settlementController.getSettlementById);
router.get('/settlement/download/xlsx',auth(), settlementController.exportToExcel);

export default router;
