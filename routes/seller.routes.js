// routes/sellerRoutes.js
import {Router} from 'express';
const router = new Router();
import {sellerController} from "../controllers";


router.get('/sellers/salesReport', sellerController.getSalesReport);
router.get('/sellers/accountPayableReport', sellerController.getAccountPayableReport);
router.get('/sellers/accountCollectedReport', sellerController.getAccountCollectedReport);
router.post('/sellers', sellerController.createSeller);
router.get('/sellers', sellerController.getAllSellers);
router.get('/sellers/:id', sellerController.getSellerById);
router.get('/sellers/download/xlsx', sellerController.exportToExcel);

export default router;
