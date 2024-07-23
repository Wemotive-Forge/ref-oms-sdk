import SearchService from "../services/oms/search.service.js";
import BadRequestParameterError from "../lib/errors/bad-request-parameter.error.js";
import NoRecordFoundError from "../lib/errors/no-record-found.error.js";

const searchService = new SearchService();

class SearchController {
  /**
   * search
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  search(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    // if(targetlanguage==='en' || !targetlanguage) //default catalog is in english hence not considering this for translation
    // {
    //     targetlanguage = undefined
    // }
    searchService
      .search(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  globalSearchItems(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    // if(targetlanguage==='en' || !targetlanguage) //default catalog is in english hence not considering this for translation
    // {
    //     targetlanguage = undefined
    // }
    searchService
      .globalSearchItems(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  getProvideDetails(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    if (targetlanguage === "en" || !targetlanguage) {
      //default catalog is in english hence not considering this for translation
      targetlanguage = undefined;
    }
    searchService
      .getProvideDetails(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  getLocationDetails(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    searchService
      .getLocationDetails(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  getItemDetails(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    if (targetlanguage === "en" || !targetlanguage) {
      //default catalog is in english hence not considering this for translation
      targetlanguage = undefined;
    }
    searchService
      .getItemDetails(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  /**
   * get attributes
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  getAttributes(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });

    searchService
      .getAttributes(searchRequest)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  getLocations(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    searchService
      .getLocations(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  getGlobalProviders(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    searchService
      .getGlobalProviders(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  /**
   * get attribute values
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  getAttributesValues(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });

    searchService
      .getAttributesValues(searchRequest)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  /**
   * get providers
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  getProviders(req, res, next) {
    const searchRequest = req.query;
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    if (targetlanguage === "en" || !targetlanguage) {
      //default catalog is in english hence not considering this for translation
      targetlanguage = undefined;
    }
    searchService
      .getProviders(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  /**
   * get custom menu
   * @param {*} req    HTTP request object
   * @param {*} res    HTTP response object
   * @param {*} next   Callback argument to the middleware function
   * @return {callback}
   */
  getCustomMenu(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });

    searchService
      .getCustomMenu(searchRequest)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  getSellerDetails(req, res, next) {
    const searchRequest = req.query;
    console.log(
      "Got Seller Details's Request =========>",
      JSON.stringify(searchRequest)
    );

    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    searchService
      .getSellers(searchRequest,targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  getSellerIds(req, res, next) {
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    searchService
      .getSellerIds(targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }  

  getFlag(req, res, next) {
    const searchRequest = req.query;
    console.log("Got GET Flag Request =========>", JSON.stringify(searchRequest));

    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    searchService
      .getFlag(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  getUniqueCity (req, res ,next){
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    searchService
      .getUniqueCity(targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  updateFlag(req, res, next) {
    const searchRequest = req.body;
    console.log("Got Flag Request =========>", JSON.stringify(searchRequest));
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    searchService
      .updateFlag(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
  
  getOffers(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });

    searchService
      .getOffers(searchRequest)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  listProviders(req, res, next) {
    const searchRequest = req.query;

    console.log({ searchRequest });
    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    searchService
      .listProviders(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  displayItems(req, res, next) {
    const searchRequest = req.query;
    const headers = req.headers;
    let targetlanguage = headers["targetlanguage"] || "en"; // Default to 'en' if not provided

    searchService
      .displayItems(searchRequest, targetlanguage)
      .then((response) => {
        if (!response) {
          throw new NoRecordFoundError("No items found");
        } else {
          res.json(response);
        }
      })
      .catch((err) => {
        next(err);
      });
  }

  getUniqueCategory (req, res ,next){
    const searchRequest = req.query;
    console.log("Got GET Unique Categories Request =========>", JSON.stringify(searchRequest));

    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];

    searchService
      .getUniqueCategories(searchRequest,targetlanguage)
      .then((response) => {
        if (!response || response === null)
          throw new NoRecordFoundError("No result found");
        else res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }

  getProviderIds(req, res, next) {
    const searchRequest = req.query;
  
    console.log({ searchRequest });

    const headers = req.headers;

    let targetlanguage = headers["targetlanguage"];
  
    searchService
      .getProviderIds(searchRequest, targetlanguage)
      .then((response) => {
        if (!response || response === null) {
          throw new NoRecordFoundError("No result found");
        } else {
          res.json(response);
        }
      })
      .catch((err) => {
        next(err);
      });
    }

    getLocationIds(req, res, next) {
      const searchRequest = req.query;
    
      console.log({ searchRequest });
    
      const headers = req.headers;

      let targetlanguage = headers["targetlanguage"];

      searchService
        .getLocationIds(searchRequest,targetlanguage)
        .then((response) => {
          if (!response || response.locations.length === 0) {
            throw new NoRecordFoundError("No result found");
          } else {
            res.json(response);
          }
        })
        .catch((err) => {
          next(err);
        });
    }
    
}

export default SearchController;
