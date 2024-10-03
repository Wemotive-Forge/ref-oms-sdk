import { Offer, OfferQualifier, OfferBenefit ,UserOfferUsage} from '../../models';
import MESSAGES from '../../utils/messages';
import { DuplicateRecordFoundError } from '../../lib/errors/errors';
import { Op } from 'sequelize';
class OfferService {
    async createOffer(offerDetails, currentUser) {

        try {
            if (offerDetails) {
                // Check for existing offer
                const existingOffer = await Offer.findOne({
                    where: {
                        offerId: offerDetails.offerId,
                    }
                });

                console.log(
                    'DuplicateRecordFoundError',DuplicateRecordFoundError
                )
                if (existingOffer) {
                    const error = new Error(MESSAGES.OFFER_CODE_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }

                // Prepare the offer object
                let offerObj = {
                    type: offerDetails.type,
                    offerId: offerDetails.offerId,
                    description: offerDetails.description,
                    validFrom: offerDetails.validFrom, // Assuming validFrom and validTo are already mapped correctly in Sequelize
                    validTo: offerDetails.validTo,
                    autoApply: offerDetails.autoApply,
                    additive: offerDetails.additive,
                    images: offerDetails.images,
                    items: offerDetails.items, // Assuming items is an array or JSONB in Sequelize
                    totalQty: offerDetails.totalQty,
                    status:offerDetails.status,
                    shortDescription: offerDetails.shortDescription
                    // updatedBy: currentUser.id,
                    // createdBy: currentUser.id,
                };

                // Save the offer
                const offer = await Offer.create(offerObj);

                // Save the offer qualifier
                let offerQualifierObj = {
                    ...offerDetails.qualifiers, // Spread the qualifier data
                    OfferId: offer.id, // Use the newly created offer's ID
                };

                await OfferQualifier.create(offerQualifierObj);

                // Save the offer benefit
                let offerBenefitObj = {
                    ...offerDetails.benefits, // Spread the benefit data
                    OfferId: offer.id, // Use the newly created offer's ID
                };

                await OfferBenefit.create(offerBenefitObj);


                return offer;
            }
        } catch (err) {
            // Rollback the transaction in case of an error
            throw err;
        }
    }

    async updateOffer(id, offerDetails, currentUser) {
        try {
            // Find existing offer
            let existingOffer = await Offer.findOne({
                where: {
                    id, // Use Sequelize's `id` field
                },
                raw: true // Equivalent to Mongoose's `.lean()`
            });

            if (!existingOffer) {
                if (existingOffer) {
                    const error = new Error(MESSAGES.OFFER_NOT_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }
            }

            // Check for duplicate offerId within the same organization
            let existingOfferId = await Offer.findOne({
                where: {
                    id: { [Op.ne]: existingOffer.id }, // Ensure the ID is different from the existing offer
                    offerId: offerDetails.offerId,
                }
            });

            if (existingOfferId) {
                if (existingOffer) {
                    const error = new Error(MESSAGES.OFFER_CODE_EXISTS);
                    error.status = 400;  // HTTP 400 Bad Request
                    throw error;
                }
            }

            // Prepare updated offer object
            let offerObj = {
                type: offerDetails.type,
                offerId: offerDetails.offerId,
                description: offerDetails.description,
                validFrom: offerDetails.validFrom, // Mapping validFrom and validTo to Sequelize fields
                validTo: offerDetails.validTo,
                autoApply: offerDetails.autoApply,
                additive: offerDetails.additive,
                images: offerDetails.images,
                items: offerDetails.items,
                totalQty: offerDetails.totalQty,
                status: offerDetails.status,
                shortDescription: offerDetails.shortDescription
            };

            // Update the offer
            await Offer.update(offerObj, {
                where: {
                    id: existingOffer.id,
                }
            });

            // Update offer qualifier
            const offerQualifier = await OfferQualifier.findOne({
                where: {
                    OfferId: existingOffer.id, // Use `offerId` to link with the offer
                },
                raw: true
            });

            if (offerQualifier) {
                const offerQualifierObj = { ...offerQualifier, ...offerDetails.qualifiers };
                await OfferQualifier.update(offerQualifierObj, {
                    where: { id: offerQualifier.id }
                });
            }

            // Update offer benefit
            const offerBenefit = await OfferBenefit.findOne({
                where: {
                    OfferId: existingOffer.id,
                },
                raw: true
            });

            if (offerBenefit) {
                const offerBenefitObj = { ...offerBenefit, ...offerDetails.benefits };
                await OfferBenefit.update(offerBenefitObj, {
                    where: { id: offerBenefit.id}
                });
            }

            return await Offer.findOne({ where: { id: existingOffer.id } }); // Return updated offer

        } catch (err) {
            throw err;
        }
    }
    async deleteOffer(currentUser, offerId) {
        try {
            let offerExist = await Offer.findOne({
                _id: offerId,
                organization: currentUser.organization,
            });
            if (!offerExist) {
                throw new NoRecordFoundError(MESSAGES.OFFER_NOT_EXISTS);
            }
            const deletedOffer = await Offer.deleteOne({ _id: offerId, organization: currentUser.organization });
            await OfferBenefit.deleteOne({ offer: offerId, organization: currentUser.organization });
            await OfferQualifier.deleteOne({ offer: offerId, organization: currentUser.organization });
            return { success: true, deletedOffer };
        } catch (err) {
            console.log(`[OfferService] [deleteCustomizations] Error - ${currentUser.organization}`, err);
            throw err;
        }
    }

    async getOfferById(offerId, currentUser) {
        try {
            const offer = await Offer.findOne({where:{
                id: offerId,
            }})

            if (!offer) {
                const error = new Error(MESSAGES.OFFER_NOT_EXISTS);
                error.status = 400;  // HTTP 400 Bad Request
                throw error;
            }
            let jsonObject = offer.toJSON()
            
            const offerBenefit = await OfferBenefit.findOne({where:{ OfferId: offerId },raw:true});

            console.log(offerBenefit)
            const offerQualifier = await OfferQualifier.findOne({where:{ OfferId: offerId },raw:true});
            jsonObject.benefits = offerBenefit;
            jsonObject.qualifiers = offerQualifier;
            return jsonObject;
        } catch (err) {
            throw err;
        }
    }


    async getOffers( data) {
        try {
            let whereCondition
            const orders = await Offer.findAndCountAll({
                where: whereCondition,
                offset: data.offset,
                limit: data.limit,
                order: [['createdAt', 'DESC']],
              });
              return orders;
        } catch (err) {
            throw err;
        }
    }

    async getOffersForUser( data) {
        try {
            let whereCondition
            const orders = await Offer.findAndCountAll({
                where: whereCondition,
                order: [['createdAt', 'DESC']],
              });
              return orders;
        } catch (err) {
            throw err;
        }
    }


}

module.exports = new OfferService();
