import { Widget,} from '../../models';
import MESSAGES from '../../utils/messages';
import { DuplicateRecordFoundError } from '../../lib/errors/errors';
import { Op } from 'sequelize';
class WidgetService {
    async createWidget(widgetDetails, currentUser) {

        try {
            if (widgetDetails) {
                // Check for existing widget
                const existingWidget = await Widget.findOne({
                    where: {
                        name: widgetDetails.name,
                    }
                });

                if (existingWidget) {
                    const error = new Error(MESSAGES.OFFER_CODE_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }

                // Prepare the widget object
                let widgetObj = {

                    page: widgetDetails.page,
                    section: widgetDetails.section,
                    name:widgetDetails.name,
                    params: widgetDetails.params,
                    cta: widgetDetails.cta,
                    status: widgetDetails.status,
                    serviceability: widgetDetails.serviceability,
                    allowRedirection: widgetDetails.allowRedirection,
                    validFrom: widgetDetails.validFrom,
                    validTo: widgetDetails.validTo,
                    image: widgetDetails.image
                };

                // Save the widget
                const widget = await Widget.create(widgetObj);

                return widget;
            }
        } catch (err) {
            // Rollback the transaction in case of an error
            throw err;
        }
    }

    async updateWidget(id, widgetDetails, currentUser) {
        try {
            // Find existing widget
            let existingWidget = await Widget.findOne({
                where: {
                    id, // Use Sequelize's `id` field
                },
                raw: true // Equivalent to Mongoose's `.lean()`
            });

            if (!existingWidget) {
                if (existingWidget) {
                    const error = new Error(MESSAGES.OFFER_NOT_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }
            }

            // Check for duplicate widgetId within the same organization
            let existingWidgetId = await Widget.findOne({
                where: {
                    id: { [Op.ne]: existingWidget.id }, // Ensure the ID is different from the existing widget
                    name: widgetDetails.name,
                }
            });

            if (existingWidgetId) {
                if (existingWidget) {
                    const error = new Error(MESSAGES.OFFER_CODE_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }
            }

            // Prepare updated widget object
            let widgetObj = {
                    page: widgetDetails.page,
                    section: widgetDetails.section,
                    name:widgetDetails.name,
                    params: widgetDetails.params,
                    cta: widgetDetails.cta,
                    status: widgetDetails.status,
                    serviceability: widgetDetails.serviceability,
                    allowRedirection: widgetDetails.allowRedirection,
                    validFrom: widgetDetails.validFrom,
                    validTo: widgetDetails.validTo,
                    image: widgetDetails.image
            };

            // Update the widget
            await Widget.update(widgetObj, {
                where: {
                    id: existingWidget.id,
                }
            });

            return await Widget.findOne({ where: { id: existingWidget.id } }); // Return updated widget

        } catch (err) {
            throw err;
        }
    }
    async deleteWidget(currentUser, widgetId) {
        try {
        } catch (err) {
            console.log(`[WidgetService]  Error - ${currentUser.organization}`, err);
            throw err;
        }
    }

    async getWidgetById(widgetId, currentUser) {
        try {
            const widget = await Widget.findOne({where:{
                id: widgetId,
            }})

            if (!widget) {
                const error = new Error(MESSAGES.OFFER_NOT_EXISTS);
                error.status = 400;  // HTTP 400 Bad Request
                throw error;
            }
            let jsonObject = widget.toJSON()

            return jsonObject;
        } catch (err) {
            throw err;
        }
    }


    async getWidgets( data) {
        try {
            let whereCondition = {}
            const widgets = await Widget.findAndCountAll({
                where: whereCondition,
                offset: data.offset,
                limit: data.limit,
                order: [['createdAt', 'DESC']],
              });
              return widgets;
        } catch (err) {
            throw err;
        }
    }

    async getWidgetsForUser( data) {
        try {
            let whereCondition = {}

            if (data.currentTime) {
                whereCondition.validFrom = {
                    [Op.lte]: data.currentTime,  // validFrom should be less than or equal to the current time
                };
                whereCondition.validTo = {
                    [Op.gte]: data.currentTime,  // validTo should be greater than or equal to the current time
                };
            }

            //default checks for active
            whereCondition.status = true

            const widgets = await Widget.findAll({
                where: whereCondition,
                order: [['createdAt', 'DESC']],
                raw:true
              });

            return widgets;
        } catch (err) {
            throw err;
        }
    }


}

module.exports = new WidgetService();
