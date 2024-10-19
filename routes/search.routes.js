import {Router} from 'express';

import SearchController from '../controllers/search.controller.js';
import {auth} from "../middlewares/authentication";

const router = new Router();
const searchController = new SearchController();

// search
router.get(
    '/search',auth(),  searchController.search,
);

// search
router.get(
    '/search/global/items',auth(),  searchController.globalSearchItems,
);

// get item details
router.get(
    '/provider-details',auth(),searchController.getProvideDetails,
);
// get item details
router.get(
    '/location-details',auth(),searchController.getLocationDetails,
);

// get item details
router.get(
    '/item-details',auth(),searchController.getItemDetails,
);

router.get(
    '/attributes',auth(),  searchController.getAttributes,
);

router.get(
    '/locations',auth(),  searchController.getLocations,
);

// get item attributes values
router.get(
    '/attributeValues',auth(),  searchController.getAttributesValues,
);

// get providers
router.get(
    '/providers',auth(),  searchController.getProviders,
);

// get providers
router.get(
    '/search/global/providers',auth(),  searchController.getGlobalProviders,
);

// get custom menus
router.get(
    '/custom-menus',auth(),  searchController.getCustomMenu,
);

// // get offers
// router.get(
//     '/offers',  searchController.getOffers,
// );

router.get(
    '/list-sellers',auth(), searchController.getSellerDetails
);

router.get(
    '/flag',auth(), searchController.getFlag
);

router.get(
    '/list-unique-cities',auth(), searchController.getUniqueCity
)

router.put(
    '/flag',auth(), searchController.updateFlag
);

router.get(
    '/list-providers',auth(), searchController.listProviders
)

router.get('/list-providers-without-pagination',auth(), searchController.listProvidersWithoutPagination)

router.get(
    '/list-items',auth(), searchController.displayItems
)

router.get(
    '/seller-ids',auth(), searchController.getSellerIds
)

router.get(
    '/list-unique-category',auth(), searchController.getUniqueCategory
)

router.get(
    '/provider-ids',auth(), searchController.getProviderIds
)

router.get(
    '/location-ids',auth(), searchController.getLocationIds
)
export default router;