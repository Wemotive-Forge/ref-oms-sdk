// routes/issueRoutes.js
import {Router} from 'express';
const router = new Router();
import {issueController} from '../controllers';


router.post('/issue', issueController.createIssue);
router.get('/issue', issueController.getAllIssues);
router.get('/issue/:id', issueController.getIssueById);
router.get('/issue/download/xlsx', issueController.exportToExcel);


export default router;
