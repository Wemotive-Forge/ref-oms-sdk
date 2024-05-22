// routes/returnRoutes.js
import express from 'express';
import {returnController} from "../controllers";

const router = express.Router();

router.post('/return', returnController.createReturn);
router.get('/return', returnController.getAllReturns);
router.get('/return/:id', returnController.getReturnById);
router.get('/return/download/xlsx', returnController.exportToExcel);

export default router;
