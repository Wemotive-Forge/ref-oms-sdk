// routes/orderRoutes.js
import {Router} from 'express';
const router = new Router();
import {widgetController} from "../controllers";

router.post('/widget',
    widgetController.storeWidget);

router.get('/widget/:widgetId',
    widgetController.getWidgetById);

router.delete('/widget/:widgetId',
    widgetController.deleteWidget);

router.get('/widget',
    widgetController.getWidgets);

router.put('/widget/:widgetId',
    widgetController.updateWidget);

router.post('/widget/upload/url',
        widgetController.upload);
     
    

export default router;
