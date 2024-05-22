// routes/sellerRoutes.js
import {Router} from 'express';
const router = new Router();
import {sellerController} from "../controllers";


router.get('/sellers/salesReport', sellerController.getSalesReport);
router.post('/sellers', sellerController.createSeller);
router.get('/sellers', sellerController.getAllSellers);
router.get('/sellers/:id', sellerController.getSellerById);
router.get('/sellers/exportExcel', sellerController.exportToExcel);

export default router;
