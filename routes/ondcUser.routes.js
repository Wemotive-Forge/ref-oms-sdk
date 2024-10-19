// routes/issueRoutes.js
import {Router} from 'express';
const router = new Router();
import {ondcUserController} from '../controllers';
import {auth} from "../middlewares/authentication";


router.post('/ondcUsers', auth(),ondcUserController.createOndcUser);
router.get('/ondcUsers', auth(),ondcUserController.getAllOndcUsers);
router.get('/ondcUsers/address',auth(), ondcUserController.getAllAddress);
router.get('/ondcUsers/:id',auth(), ondcUserController.getOndcUserById);
//router.get('/ondcUsers/download/xlsx', ondcUserController.exportToExcel);


export default router;
