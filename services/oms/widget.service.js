import { Widget,WidgetSection,Tag,ProviderTagMapping} from '../../models';
import MESSAGES from '../../utils/messages';
import { DuplicateRecordFoundError } from '../../lib/errors/errors';
import client from "../../database/elasticSearch.js";
import { Op } from 'sequelize';
import { raw } from 'body-parser';
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
                    image: widgetDetails.image,
                    domain: widgetDetails.domain,
                    TagId: widgetDetails.TagId
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

    async createWidgetSection(widgetDetailsSection, currentUser) {

        try {
            if (widgetDetailsSection) {
                // Check for existing widget
                const existingWidgetSection = await WidgetSection.findOne({
                    where: {
                        name: widgetDetailsSection.name,
                    }
                });

                if (existingWidgetSection) {
                    const error = new Error(MESSAGES.OFFER_SECTION_CODE_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }

                // Prepare the widget object
                let widgetSectionObj = {
                    page: widgetDetailsSection.page,
                    section: widgetDetailsSection.section,
                    name:widgetDetailsSection.name,
                    maxItems:widgetDetailsSection.maxItems,
                    alignTitle: widgetDetailsSection.alignTitle,
                    left:widgetDetailsSection.left,
                    backgroundColor:widgetDetailsSection.backgroundColor,
                    typeOfSection:widgetDetailsSection.typeOfSection,
                    imageHeight:widgetDetailsSection.imageHeight,
                    imageWidth:widgetDetailsSection.imageWidth
                };

                // Save the widget section
                const widgetSection = await WidgetSection.create(widgetSectionObj);

                return widgetSection ;
            }
        } catch (err) {
            // Rollback the transaction in case of an error
            throw err;
        }
    }

    async createWidgetTags(widgetTags, currentUser) {

        try {
            if (widgetTags) {
                const existingWidgetTags = await Tag.findOne({
                    where: {
                        name: widgetTags.name,
                    }
                });

                if (existingWidgetTags) {
                    const error = new Error(MESSAGES.OFFER_SECTION_CODE_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }

                let widgetTagObj = {
                    name: widgetTags.name,
                    pageTitle: widgetTags.pageTitle
                };
                const widgetTg = await Tag.create(widgetTagObj);

                return widgetTg ;
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
                    image: widgetDetails.image,
                    domain: widgetDetails.domain,
                    TagId: widgetDetails.TagId
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




    async updateWidgetSection(id, widgetSectionDetails, currentUser) {
        try {
            // Find existing widget
            let existingWidgetSection = await WidgetSection.findOne({
                where: {
                    id, // Use Sequelize's `id` field
                },
                raw: true // Equivalent to Mongoose's `.lean()`
            });

            if (!existingWidgetSection) {
                if (existingWidgetSection) {
                    const error = new Error(MESSAGES.OFFER_SECTION_NOT_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }
            }

            // Check for duplicate widgetId within the same organization
            let existingWidgetSectionId = await WidgetSection.findOne({
                where: {
                    id: { [Op.ne]: existingWidgetSection.id }, // Ensure the ID is different from the existing widget
                    name: widgetSectionDetails.name,
                }
            });

            if (existingWidgetSectionId) {
                if (existingWidgetSection) {
                    const error = new Error(MESSAGES.OFFER_SECTION_CODE_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }
            }

            // Prepare updated widget object
            let widgetSectionObj = {
                page: widgetSectionDetails.page,
                section: widgetSectionDetails.section,
                name:widgetSectionDetails.name,
                maxItems:widgetSectionDetails.maxItems,
                alignTitle: widgetSectionDetails.alignTitle,
                left:widgetSectionDetails.left,
                backgroundColor:widgetSectionDetails.backgroundColor,
                typeOfSection:widgetSectionDetails.typeOfSection,
                imageHeight:widgetSectionDetails.imageHeight,
                imageWidth:widgetSectionDetails.imageWidth
            };

            // Update the widget
            await WidgetSection.update(widgetSectionObj, {
                where: {
                    id: existingWidgetSection.id,
                }
            });

            return await WidgetSection.findOne({ where: { id: existingWidgetSection.id } }); // Return updated widget

        } catch (err) {
            throw err;
        }
    }


    async updateWidgetTags(id, widgetTagDetails, currentUser) {
        try {
            // Find existing widget
            let existingWidgetTag = await Tag.findOne({
                where: {
                    id, // Use Sequelize's `id` field
                },
                raw: true // Equivalent to Mongoose's `.lean()`
            });

            if (!existingWidgetTag) {
                if (existingWidgetTag) {
                    const error = new Error(MESSAGES.OFFER_SECTION_NOT_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }
            }

            // Check for duplicate widgetId within the same organization
            let existingWidgetTagId = await Tag.findOne({
                where: {
                    id: { [Op.ne]: existingWidgetTag.id }, // Ensure the ID is different from the existing widget
                    name: widgetTagDetails.name
                }
            });

            if (existingWidgetTagId) {
                if (existingWidgetTag) {
                    const error = new Error(MESSAGES.OFFER_SECTION_CODE_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }
            }

            // Prepare updated widget object
            let widgetTagObj = {
                name:widgetTagDetails.name,
                pageTitle: widgetTagDetails.pageTitle
            };

            // Update the widget
            await Tag.update(widgetTagObj, {
                where: {
                    id: existingWidgetTag.id,
                }
            });

            return await Tag.findOne({ where: { id: existingWidgetTag.id } }); // Return updated widget

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

    async getWidgetSectionById(widgetSectionId, currentUser) {
        try {
            const widgetSection = await WidgetSection.findOne({where:{
                    id: widgetSectionId,
                }})

            if (!widgetSection) {
                const error = new Error(MESSAGES.OFFER_NOT_EXISTS);
                error.status = 400;  // HTTP 400 Bad Request
                throw error;
            }
            let jsonObject = widgetSection.toJSON()

            return jsonObject;
        } catch (err) {
            throw err;
        }
    }

    async getWidgetTagsById(tagId, currentUser) {
        try {
            const widgetTag = await Tag.findOne({where:{
                    id: tagId,
                }})

            if (!widgetTag) {
                const error = new Error(MESSAGES.OFFER_NOT_EXISTS);
                error.status = 400;  // HTTP 400 Bad Request
                throw error;
            }
            let jsonObject = widgetTag.toJSON()

            return jsonObject;
        } catch (err) {
            throw err;
        }
    }


    async getWidgetSections( data) {
        try {
            console.log("get widgetSections");
            let whereCondition = {}
            const widgetSections = await WidgetSection.findAndCountAll({
                where: whereCondition,
                offset: data.offset,
                limit: data.limit,
                order: [['createdAt', 'DESC']],
            });
            return widgetSections;
        } catch (err) {
            throw err;
        }
    }




    async getWidgetTags( data) {
        try {
            let whereCondition = {}
            const widgetTag = await Tag.findAndCountAll({
                where: whereCondition,
                offset: data.offset,
                limit: data.limit,
                order: [['createdAt', 'DESC']],
            });
            return widgetTag;
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
                include: [{
                    model: Tag,  // Include the Tag model
                    as: 'Tag',   // Alias if necessary (optional)
                    attributes: ['id', 'name']  // Only fetch specific attributes of Tag
                }]
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

    async saveProviderTagMapping(data,currentUser) {
        try {
            const { TagId, providerIds } = data;

            for (const providerId of providerIds) {
                await ProviderTagMapping.create({
                    providerId,
                    TagId,
                    createdBy: 'system',  // You can adjust this based on your logic
                    updatedBy: 'system'   // You can adjust this based on your logic
                });
            }
            console.log('ProviderTagMapping saved successfully.');
            return true;
        } catch (error) {
            console.error('Error saving ProviderTagMapping:', error);
        }
    }

    async updateProviderTagMapping(data,currentUser) {
        try {
            const { TagId, providerIds } = data;

            // Step 1: Fetch all existing providerIds for the given TagId
            const existingMappings = await ProviderTagMapping.findAll({
                where: { TagId },
                attributes: ['id', 'providerId']
            });

            const existingProviderIds = existingMappings.map(mapping => mapping.providerId);

            // Step 2: Determine which providerIds to remove and which to add
            const toRemove = existingProviderIds.filter(id => !providerIds.includes(id));
            const toAdd = providerIds.filter(id => !existingProviderIds.includes(id));

            // Step 3: Remove entries that are not in the new providerIds array
            if (toRemove.length > 0) {
                await ProviderTagMapping.destroy({
                    where: {
                        providerId: {
                            [Op.in]: toRemove
                        },
                        TagId
                    }
                });
            }

            // Step 4: Add new providerIds that aren't already in the database
            for (const providerId of toAdd) {
                await ProviderTagMapping.create({
                    providerId,
                    TagId,
                    createdBy: 'system',  // You can adjust this based on your logic
                    updatedBy: 'system'   // You can adjust this based on your logic
                });
            }

            return true;
            console.log('ProviderTagMapping updated successfully.');
        } catch (error) {
            console.error('Error updating ProviderTagMapping:', error);
        }
    }

    async getTagsByProviderId(providerId,currentUser) {
        try {
            // Step 1: Fetch all ProviderTagMapping entries for the given providerId, including the associated Tag
            const mappings = await ProviderTagMapping.findAll({
                where: { providerId},
                include: [
                    {
                        model: Tag,
                        attributes: [ 'name']  // Specify the attributes you want from the Tag model
                    }
                ]
            });

            // Step 2: Extract the tag details from the mappings
            const tags = mappings.map(mapping => mapping.Tag.name);

            console.log('Tags associated with providerId:', tags);
            
            return tags;
            
        } catch (error) {
            console.error('Error fetching tags for providerId:', error);
            return [];
        }
    }

    async getAllTagsProviderMapping(providerId){
        const mappings = await ProviderTagMapping.findAll({
            where: { providerId},
            raw: true
        });

        let queryResults = await client.search({
            query: {
                match: {
                    "provider_details.id": providerId,
                }
            },
            size: 1
        });
        
        
        return mappings.map((map)=>{
            return {
                ...map,
                provider : queryResults.hits.hits[0]._source.provider_details.descriptor,
                context: queryResults.hits.hits[0]._source.context,
                bppDetails: queryResults.hits.hits[0]._source.bpp_details
                
            }
        });


    }


}

module.exports = new WidgetService();
