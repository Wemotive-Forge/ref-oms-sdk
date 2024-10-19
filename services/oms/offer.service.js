import { Offer, OfferQualifier, OfferBenefit ,UserOfferUsage,OfferLock,sequelize} from '../../models';
import MESSAGES from '../../utils/messages';
import { DuplicateRecordFoundError } from '../../lib/errors/errors';
import { Op } from 'sequelize';
import offerQualifier from '../../models/oms/offerQualifier';
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
            let whereCondition = {}
            const offers = await Offer.findAndCountAll({
                where: whereCondition,
                offset: data.offset,
                limit: data.limit,
                order: [['createdAt', 'DESC']],
              });
              return offers;
        } catch (err) {
            throw err;
        }
    }

    async applyOffer(userId, offerId, quantity) {
        const offer = await Offer.findOne({ where: { id: offerId } });
        if (!offer) {
            return false
        }

        if (offer.totalQty < quantity) {
            return false
        }

        const offerQualifier = await OfferQualifier.findOne({ where: { OfferId: offer.id } });
        if (!offerQualifier) {
            return false
        }

        // Retrieve previous user usage of the offer
        const currentDate = new Date();
        const startDate = new Date();

        // Check usage frequency and adjust startDate accordingly
        switch (offerQualifier.usageFrequency) {
            case 'DAY':
                startDate.setDate(currentDate.getDate() - offerQualifier.usageDurationInDays);
                break;
            case 'WEEK':
                startDate.setDate(currentDate.getDate() - 7 * offerQualifier.usageDurationInDays);
                break;
            case 'MONTH':
                startDate.setMonth(currentDate.getMonth() - offerQualifier.usageDurationInDays);
                break;
            default:
                return false
        }

        const usageCountTotal = await OfferLock.count({
            where: {
                userId,
                offerId,
            },
        });

        if(usageCountTotal>=offerQualifier.maxUsagePerUser){
            console.log("max usage exhausted")
            return false
        }

        // Count the user's previous usage of this offer within the time window
        const usageCount = await OfferLock.count({
            where: {
                userId,
                offerId,
                createdAt: {
                    [Op.between]: [startDate, currentDate],
                },
                status:{[Op.in]:['APPLIED','CLAIMED']}
            },
        });

        console.log("usageCount",usageCount)
        console.log("offerQualifier.maxUsagePerUser",offerQualifier.maxUsagePerUser)
        if (usageCount >= offerQualifier.maxUsagePerUser) {
            return false
        }

        // Lock the offer
        const lockExpiration = new Date();
        lockExpiration.setMinutes(lockExpiration.getMinutes() + 5);

        await sequelize.transaction(async (t) => {
            await OfferLock.create({
                offerId,
                userId,
                quantity,
                expiresAt: lockExpiration,
                status: 'APPLIED'
            }, { transaction: t });

            // Decrement the totalQty in Offer
            await offer.update({ totalQty: offer.totalQty - quantity }, { transaction: t });
        });

        // Set a timer to release the lock after 30 minutes
        setTimeout(async () => {
            await this.releaseLock(userId, offerId, 'APPLIED', undefined);
        }, 30 * 60 * 1000);

        return true
    }

    async releaseLock(userId, offerId,status,txnId=undefined) {
        console.log("status",status==='APPLIED',status==='CLAIMED',status==='CANCELED');
        if(status==='APPLIED'){
            console.log('Apply coupon')
            const lock = await OfferLock.findOne({ where: { userId, offerId ,status:'APPLIED'} });
            // if (lock && new Date() > lock.expiresAt) {
            console.log("doing reversal")
            // Lock expired, restore the count
            if(lock){
                await sequelize.transaction(async (t) => {
                    const offer = await Offer.findOne({ where: { id: offerId }, transaction: t });
                    await offer.update({ totalQty: offer.totalQty + lock.quantity }, { transaction: t });

                    // Remove the expired lock
                    // await lock.destroy({ transaction: t });
                });
            }

        }else if(status==='CLAIMED'){
            console.log('claim coupon')
            const offer = await Offer.findOne({ where: { offerId: offerId } });
            const lock = await OfferLock.findOne({ where: { userId, offerId:offer.id ,status:'APPLIED'} });
            // Lock CLAIMED
            if(lock){
                await sequelize.transaction(async (t) => {
                    await lock.update({ status:"CLAIMED" ,txnId:txnId},{ transaction: t });
                });
            }

        }else if(status==='CANCELED'){
            const offer = await Offer.findOne({ where: { offerId: offerId } });

            console.log("offer",offer);
            //ORDERID
            const lock = await OfferLock.findOne({ where: { userId, offerId:offer.id ,txnId:txnId,status:'CLAIMED'} });

            console.log("lock",lock);
            // Lock expired, restore the count
            await sequelize.transaction(async (t) => {
                const offerUpdate = await Offer.findOne({ where: { id: offer.id }, transaction: t });
                await offerUpdate.update({ totalQty: offer.totalQty + lock.quantity }, { transaction: t });
                await lock.update({ status:status ,txnId:txnId},{ transaction: t });
                // Remove the expired lock
                // await lock.destroy({ transaction: t });
            });
        }

    }

    async getOffersForUser( data) {
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

            //default check for coupon count
            whereCondition.totalQty = {
                [Op.gt]: 0,
              };

            const offers = await Offer.findAll({
                where: whereCondition,
                order: [['createdAt', 'DESC']],
                raw:true
              });

              let offerList = []
              for(let offer of offers){
                const offerBenefit = await OfferBenefit.findOne({where:{ OfferId: offer.id },raw:true});

                console.log(offerBenefit)
                const offerQualifier = await OfferQualifier.findOne({where:{ OfferId: offer.id },raw:true});

                    //check if user id has used the coupon or not
                    console.log("offer usage per user--->",offerQualifier.maxUsagePerUser)
                    console.log("offer usage per day--->",offerQualifier.usageDurationInDays)
                //check in user usage DB if user has used coupon before 
                offer.offerBenefit =  offerBenefit;
                offer.offerQualifier =  offerQualifier;
                offer.allowedUsage = true;
                offerList.push(offer)
              }

              return offerList;
        } catch (err) {
            throw err;
        }
    }


}

module.exports = new OfferService();
