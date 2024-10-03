// routes/orderRoutes.js
import {Router} from 'express';
const router = new Router();
import {offerController} from "../controllers";


router.post('/offers',
    offerController.storeOffer);

router.get('/offers/:offerId',
    offerController.getOfferById);

router.delete('/offers/:offerId',
    offerController.deleteOffer);

router.get('/offers',
    offerController.getOffers);

router.put('/offers/:offerId',
    offerController.updateOffer);

router.get('/offers/user/:userId',
    offerController.getOffersForUser);    
export default router;
