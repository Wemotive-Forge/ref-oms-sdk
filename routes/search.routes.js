import {Router} from 'express';

import SearchController from '../controllers/search.controller.js';

const router = new Router();
const searchController = new SearchController();

// search
router.get(
    '/search',  searchController.search,
);

// search
router.get(
    '/search/global/items',  searchController.globalSearchItems,
);

// get item details
router.get(
    '/provider-details',searchController.getProvideDetails,
);
// get item details
router.get(
    '/location-details',searchController.getLocationDetails,
);

// get item details
router.get(
    '/item-details',searchController.getItemDetails,
);

router.get(
    '/attributes',  searchController.getAttributes,
);

router.get(
    '/locations',  searchController.getLocations,
);

// get item attributes values
router.get(
    '/attributeValues',  searchController.getAttributesValues,
);

// get providers
router.get(
    '/providers',  searchController.getProviders,
);

// get providers
router.get(
    '/search/global/providers',  searchController.getGlobalProviders,
);

// get custom menus
router.get(
    '/custom-menus',  searchController.getCustomMenu,
);

// get offers
router.get(
    '/offers',  searchController.getOffers,
);

router.post(
    '/addErrorTags', searchController.addErrorTags,
)

router.get(
    '/searchErrorTags', searchController.searchItemsWithErrorTags,
)

export default router;