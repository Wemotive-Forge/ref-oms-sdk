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

//sections
router.post('/widget/section',
    widgetController.storeWidgetSection);

router.get('/widget/section/all',
    widgetController.getWidgetSections);

router.get('/widget/section/:widgetSectionId',
    widgetController.getWidgetSectionById);

router.put('/widget/section/:widgetSectionId',
    widgetController.updateWidgetSection);

//sections
router.post('/widget/tags',
    widgetController.storeWidgetTags);

router.get('/widget/tags/all',
    widgetController.getWidgetTags);

router.get('/widget/tags/:widgetTagsId',
    widgetController.getWidgetTagsById);

router.put('/widget/tags/:widgetTagsId',
    widgetController.updateWidgetTags);

//upload url
router.post('/widget/upload/url',
    widgetController.upload);


export default router;