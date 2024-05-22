// routes/orderRoutes.js
import {Router} from 'express';
const router = new Router();
import {orderController} from "../controllers";


router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.get('/orders/state/count', orderController.getOrderStateCountsController);
router.get('/orders/exportExcel', orderController.exportToExcel);

export default router;
