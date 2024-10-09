import { widgetService } from "../services/oms";

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
}

module.exports = new  WidgetController();
