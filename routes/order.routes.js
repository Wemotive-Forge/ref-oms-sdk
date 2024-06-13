// routes/orderRoutes.js
import {Router} from 'express';
const router = new Router();
import {orderController} from "../controllers";


router.post('/orders', orderController.createOrder);
router.post('/orders/bulk', orderController.bulkCreateOrder);
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.get('/orders/state/count', orderController.getOrderStateCounts);
router.get('/orders/download/xlsx', orderController.exportToExcel);
router.get('/financials/donwload/xlsx', orderController.exportFinancialsToExcel)

export default router;
