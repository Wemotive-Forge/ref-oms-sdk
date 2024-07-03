import {Router} from 'express';

import SearchController from '../controllers/search.controller.js';

const router = new Router();
const searchController = new SearchController();

// search
router.get(
    '/v2/search',  searchController.search,
);

// search
router.get(
    '/v2/search/global/items',  searchController.globalSearchItems,
);

// get item details
router.get(
    '/v2/provider-details',searchController.getProvideDetails,
);
// get item details
router.get(
    '/v2/location-details',searchController.getLocationDetails,
);

// get item details
router.get(
    '/v2/item-details',searchController.getItemDetails,
);

router.get(
    '/v2/attributes',  searchController.getAttributes,
);

router.get(
    '/v2/locations',  searchController.getLocations,
);

// get item attributes values
router.get(
    '/v2/attributeValues',  searchController.getAttributesValues,
);

// get providers
router.get(
    '/v2/providers',  searchController.getProviders,
);

// get providers
router.get(
    '/v2/search/global/providers',  searchController.getGlobalProviders,
);

// get custom menus
router.get(
    '/v2/custom-menus',  searchController.getCustomMenu,
);

// get offers
router.get(
    '/v2/offers',  searchController.getOffers,
);

export default router;