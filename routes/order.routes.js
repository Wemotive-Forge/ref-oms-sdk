// routes/orderRoutes.js
import {Router} from 'express';
const router = new Router();
import {orderController} from "../controllers";
import {auth} from "../middlewares/authentication";


router.post('/orders', auth(),orderController.createOrder);
router.get('/orders', auth(),orderController.getAllOrders);
router.get('/orders/:id',auth(),orderController.getOrderById);
router.get('/orders/state/count',auth(), orderController.getOrderStateCounts);
router.get('/orders/download/xlsx',auth(), orderController.exportToExcel);
router.get('/financials/donwload/xlsx',auth(), orderController.exportFinancialsToExcel)

export default router;
