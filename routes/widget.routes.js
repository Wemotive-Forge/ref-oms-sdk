// routes/orderRoutes.js
import {Router} from 'express';
const router = new Router();
import {widgetController} from "../controllers";
import {auth} from "../middlewares/authentication";

router.post('/widget',auth(),
    widgetController.storeWidget);

router.get('/widget/:widgetId',auth(),
    widgetController.getWidgetById);

router.delete('/widget/:widgetId',auth(),
    widgetController.deleteWidget);

router.get('/widget',auth(),
    widgetController.getWidgets);

router.get('/widget/user/all',auth(),
    widgetController.getWidgetsForUser);

router.put('/widget/:widgetId',auth(),
    widgetController.updateWidget);

router.post('/widget/upload/url',auth(),
        widgetController.upload);

//sections
router.post('/widget/section',auth(),
    widgetController.storeWidgetSection);

router.get('/widget/section/all',auth(),
    widgetController.getWidgetSections);

router.get('/widget/section/:widgetSectionId',auth(),
    widgetController.getWidgetSectionById);

router.put('/widget/section/:widgetSectionId',auth(),
    widgetController.updateWidgetSection);

//sections
router.post('/widget/tags',auth(),
    widgetController.storeWidgetTags);

router.get('/widget/tags/all',auth(),
    widgetController.getWidgetTags);

router.get('/widget/tags/:widgetTagsId',auth(),
    widgetController.getWidgetTagsById);

router.put('/widget/tags/:widgetTagsId',auth(),
    widgetController.updateWidgetTags);

router.post('/widget/tags/providers',auth(),
    widgetController.saveProviderTagMapping);

router.put('/widget/tags/providers/mapping',auth(),
    widgetController.updateProviderTagMapping);

router.get('/widget/tags/providers/all',
    widgetController.getTagsProviderMappingAll);

router.get('/widget/tags/providers/:providerId',auth(),
    widgetController.getTagsByProviderId);

router.get('/widget/tags/providers/mapping/:tagId',auth(),
        widgetController.getTagsProviderMapping);

router.post('/widget/upload/url',auth(),
    widgetController.upload);


export default router;
