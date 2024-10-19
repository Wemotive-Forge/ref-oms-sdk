import { offerService } from "../services/oms";

class OfferController {
    async storeOffer(req, res, next) {
        try {
            const data = req.body;
            const offer = await offerService.createOffer(data, req.user);
            return res.send(offer);
        } catch (error) {
            next(error);
        }
    }

    async getOffers(req, res, next) {
        try {
            const currentUser = req.user;
            const offers = await offerService.getOffers(req.query,currentUser);
            return res.json(offers);
        } catch (error) {
            next(error);
        }
    }

    async getOffersForUser(req, res, next) {
        try {
            const currentUser = req.user;
            const offers = await offerService.getOffersForUser(req.query,currentUser);
            return res.json(offers);
        } catch (error) {
            next(error);
        }
    }
    async applyOffer(req, res, next) {
        try {
            const currentUser = req.user;
            const offers = await offerService.applyOffer(req.body.userId,req.body.offerId,1);
            return res.json(offers);
        } catch (error) {
            next(error);
        }
    }

    async updateOffer(req, res, next) {
        try {
            const currentUser = req.user;
            const data = req.body;
            const {offerId} = req.params;
            const updateResult = await offerService.updateOffer(offerId,data, currentUser);
            return res.send(updateResult);
        } catch (error) {
            next(error);
        }
    }

    async deleteOffer(req, res, next) {
        try {
            const currentUser = req.user;
            const {offerId} = req.params;
            const deleteResult = await offerService.deleteOffer(currentUser, offerId);
            return res.send(deleteResult);
        } catch(error) {
            next(error);
        }
    }

    async getOfferById(req, res, next) {
        const { offerId } = req.params;
        try{
            const currentUser = req.user;
            const offer = await offerService.getOfferById(offerId, currentUser);
            return res.send(offer);
        } catch(error) {
            next(error);
        }
    }
}

module.exports = new  OfferController();
