// routes/issueRoutes.js
import {Router} from 'express';
const router = new Router();
import {ondcUserController} from '../controllers';


router.post('/ondcUsers', ondcUserController.createOndcUser);
router.get('/ondcUsers', ondcUserController.getAllOndcUsers);
router.get('/ondcUsers/address', ondcUserController.getAllAddress);
router.get('/ondcUsers/:id', ondcUserController.getOndcUserById);
//router.get('/ondcUsers/download/xlsx', ondcUserController.exportToExcel);


export default router;
