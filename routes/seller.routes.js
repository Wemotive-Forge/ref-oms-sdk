// routes/sellerRoutes.js
import {Router} from 'express';
const router = new Router();
import {sellerController} from "../controllers";


router.get('/sellers/salesReport', sellerController.getSalesReport);
router.get('/sellers/financeReport', sellerController.getFinanceReport);
router.get('/sellers/financeReportCount', sellerController.getFinanceReportCount);
router.get('/sellers/salesReportTrend', sellerController.getSalesReportTrend);
router.get('/sellers/accountPayableReport', sellerController.getAccountPayableReport);
router.get('/sellers/accountCollectedReport', sellerController.getAccountCollectedReport);

router.get('/sellers/issueReport', sellerController.getIssueReport);
router.get('/sellers/issueReportCount', sellerController.getIssueReportCount);

router.post('/sellers', sellerController.createSeller);
router.get('/sellers', sellerController.getAllSellers);
router.get('/sellers/:id', sellerController.getSellerById);
router.get('/sellers/download/xlsx', sellerController.exportToExcel);

export default router;
