// routes/issueRoutes.js
import {Router} from 'express';
const router = new Router();
import {issueController} from '../controllers';
import {auth} from "../middlewares/authentication";


router.post('/issue',auth(), issueController.createIssue);
router.get('/issue',auth(), issueController.getAllIssues);
router.get('/issue/:id', auth(),issueController.getIssueById);
router.get('/issue/download/xlsx',auth(), issueController.exportToExcel);


export default router;
