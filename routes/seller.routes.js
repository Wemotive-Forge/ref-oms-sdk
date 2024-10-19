// routes/sellerRoutes.js
import {Router} from 'express';
const router = new Router();
import {sellerController} from "../controllers";
import {auth} from "../middlewares/authentication";


router.get('/sellers/salesReport',auth(), sellerController.getSalesReport);
router.get('/sellers/financeReport', auth(),sellerController.getFinanceReport);
router.get('/sellers/financeReportCount',auth(), sellerController.getFinanceReportCount);
router.get('/sellers/salesReportTrend',auth(), sellerController.getSalesReportTrend);
router.get('/sellers/accountPayableReport',auth(), sellerController.getAccountPayableReport);
router.get('/sellers/accountCollectedReport', auth(),sellerController.getAccountCollectedReport);

router.get('/sellers/issueReport',auth(), sellerController.getIssueReport);
router.get('/sellers/issueReportCount',auth(), sellerController.getIssueReportCount);

router.post('/sellers', auth(),sellerController.createSeller);
router.get('/sellers',auth(), sellerController.getAllSellers);
router.get('/sellers/:id',auth(), sellerController.getSellerById);
router.get('/sellers/download/xlsx',auth(), sellerController.exportToExcel);

export default router;
