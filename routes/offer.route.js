// routes/orderRoutes.js
import {Router} from 'express';
const router = new Router();
import {offerController} from "../controllers";
import {auth} from "../middlewares/authentication";


router.post('/offers',auth(),
    offerController.storeOffer);

router.get('/offers/:offerId',auth(),
    offerController.getOfferById);

router.delete('/offers/:offerId',auth(),
    offerController.deleteOffer);

router.get('/offers',auth(),
    offerController.getOffers);

router.put('/offers/:offerId',auth(),
    offerController.updateOffer);

router.get('/offers/user/:userId',auth(),
    offerController.getOffersForUser);

router.post('/offers/user/apply',auth(),
    offerController.applyOffer);

export default router;
