import { widgetService } from "../services/oms";
import getSignedUrlForUpload from '../utils/s3Utils';
class WidgetController {
    async storeWidget(req, res, next) {
        try {
            const data = req.body;
            const widget = await widgetService.createWidget(data, req.user);
            return res.send(widget);
        } catch (error) {
            next(error);
        }
    }

    async getWidgets(req, res, next) {
        try {
            const currentUser = req.user;
            const widgets = await widgetService.getWidgets(req.query,currentUser);
            return res.json(widgets);
        } catch (error) {
            next(error);
        }
    }

    async getWidgetsForUser(req, res, next) {
        try {
            const currentUser = req.user;
            const widgets = await widgetService.getWidgetsForUser(req.query,currentUser);
            return res.json(widgets);
        } catch (error) {
            next(error);
        }
    }

    async updateWidget(req, res, next) {
        try {
            const currentUser = req.user;
            const data = req.body;
            const {widgetId} = req.params;
            const updateResult = await widgetService.updateWidget(widgetId,data, currentUser);
            return res.send(updateResult);
        } catch (error) {
            next(error);
        }
    }

    async deleteWidget(req, res, next) {
        try {
            const currentUser = req.user;
            const {widgetId} = req.params;
            const deleteResult = await widgetService.deleteWidget(currentUser, widgetId);
            return res.send(deleteResult);
        } catch(error) {
            next(error);
        }
    }

    async getWidgetById(req, res, next) {
        const { widgetId } = req.params;
        try{
            const currentUser = req.user;
            const widget = await widgetService.getWidgetById(widgetId, currentUser);
            return res.send(widget);
        } catch(error) {
            next(error);
        }
    }

    async upload(req, res, next) {
        const currentUser = req.user;
        return res.send(await getSignedUrlForUpload({path:'widget', ...req.body, currentUser}));
    }

    //sections

    async storeWidgetSection(req, res, next) {
        try {
            const data = req.body;
            const widgetSection = await widgetService.createWidgetSection(data, req.user);
            return res.send(widgetSection);
        } catch (error) {
            next(error);
        }
    }

    async getWidgetSections(req, res, next) {
        try {
            const currentUser = req.user;
            const widgetSections = await widgetService.getWidgetSections(req.query,currentUser);
            return res.json(widgetSections);
        } catch (error) {
            next(error);
        }
    }

    async getWidgetSectionsForUser(req, res, next) {
        try {
            const currentUser = req.user;
            const widgetSections = await widgetService.getWidgetSectionsForUser(req.query,currentUser);
            return res.json(widgetSections);
        } catch (error) {
            next(error);
        }
    }

    async updateWidgetSection(req, res, next) {
        try {
            const currentUser = req.user;
            const data = req.body;
            const {widgetSectionId} = req.params;
            const updateResult = await widgetService.updateWidgetSection(widgetSectionId,data, currentUser);
            return res.send(updateResult);
        } catch (error) {
            next(error);
        }
    }

    async deleteWidgetSection(req, res, next) {
        try {
            const currentUser = req.user;
            const {widgetSectionId} = req.params;
            const deleteResult = await widgetService.deleteWidgetSection(currentUser, widgetSectionId);
            return res.send(deleteResult);
        } catch(error) {
            next(error);
        }
    }

    async getWidgetSectionById(req, res, next) {
        const { widgetSectionId } = req.params;
        try{
            const currentUser = req.user;
            const widget = await widgetService.getWidgetSectionById(widgetSectionId, currentUser);
            return res.send(widget);
        } catch(error) {
            next(error);
        }
    }


    //tags
    async storeWidgetTags(req, res, next) {
        try {
            const data = req.body;
            const widgetTags = await widgetService.createWidgetTags(data, req.user);
            return res.send(widgetTags);
        } catch (error) {
            next(error);
        }
    }

    async getWidgetTags(req, res, next) {
        try {
            const currentUser = req.user;
            const widgetTags = await widgetService.getWidgetTags(req.query,currentUser);
            return res.json(widgetTags);
        } catch (error) {
            next(error);
        }
    }

    async updateWidgetTags(req, res, next) {
        try {
            const currentUser = req.user;
            const data = req.body;
            const {widgetTagsId} = req.params;
            const updateResult = await widgetService.updateWidgetTags(widgetTagsId,data, currentUser);
            return res.send(updateResult);
        } catch (error) {
            next(error);
        }
    }

    async getWidgetTagsById(req, res, next) {
        const { widgetTagsId } = req.params;
        try{
            const currentUser = req.user;
            const tags = await widgetService.getWidgetTagsById(widgetTagsId, currentUser);
            return res.send(tags);
        } catch(error) {
            next(error);
        }
    }


    async getTagsByProviderId(req, res, next) {

        const { providerId } = req.params;
        try{
            const currentUser = req.user;
            const tags = await widgetService.getTagsByProviderId(providerId, currentUser);
            return res.send(tags);
        } catch(error) {
            next(error);
        }
    }

    async getTagsProviderMapping(req, res, next) {

        const { providerId } = req.params;
        try{
            const currentUser = req.user;
            const tags = await widgetService.getAllTagsProviderMapping(providerId, currentUser);
            return res.send(tags);
        } catch(error) {
            next(error);
        }
    }


    async updateProviderTagMapping(req, res, next) {
        const { providerId } = req.params;
        try{
            const currentUser = req.user;
            const tags = await widgetService.updateProviderTagMapping(req.body, currentUser);
            return res.send(tags);
        } catch(error) {
            next(error);
        }
    }


    async saveProviderTagMapping(req, res, next) {
        const { providerId } = req.params;
        try{
            const currentUser = req.user;
            const tags = await widgetService.saveProviderTagMapping(req.body, currentUser);
            return res.send(tags);
        } catch(error) {
            next(error);
        }
    }

}

module.exports = new  WidgetController();
