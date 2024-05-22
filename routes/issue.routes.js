// routes/issueRoutes.js
import {Router} from 'express';
const router = new Router();
import {issueController} from '../controllers';


router.post('/issue', issueController.createIssue);
router.get('/issue', issueController.getAllIssues);
router.get('/issue/:id', issueController.getIssueById);
router.get('/issue/exportExcel', issueController.exportToExcel);

export default router;
