// routes/returnRoutes.js
import express from 'express';
import {returnController} from "../controllers";
import {auth} from "../middlewares/authentication";

const router = express.Router();

router.post('/return',auth(),returnController.createReturn);
router.get('/return', auth(),returnController.getAllReturns);
router.get('/return/:id',auth(), returnController.getReturnById);
router.get('/return/download/xlsx',auth(), returnController.exportToExcel);

export default router;
