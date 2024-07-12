import _ from "lodash";
import client from '../../database/elasticSearch.js';
import NoRecordFoundError from "../../lib/errors/no-record-found.error.js";
import BadRequestParameterError from "../../lib/errors/bad-request-parameter.error.js";

class SearchService {
  isBppFilterSpecified(context = {}) {
    return typeof context.bpp_id !== "undefined";
  }

  async search(searchRequest = {}, targetLanguage = "en") {
    try {
      // providerIds=ondc-mock-server-dev.thewitslab.com_ONDC:RET10_ondc-mock-server-dev.thewitslab.com
      let matchQuery = [];

      // bhashini translated data
      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      if (searchRequest.name) {
        matchQuery.push({
          match: {
            "item_details.descriptor.name": searchRequest.name,
          },
        });
      }

      if (searchRequest.providerIds) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.providerIds,
          },
        });
      }

      if (searchRequest.categoryIds) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.categoryIds,
          },
        });
      }

      // for variants we set is_first = true
      matchQuery.push({
        match: {
          is_first: true,
        },
      });

      let query_obj = {
        bool: {
          must: matchQuery,
        },
        // "should": [ //TODO: enable this once UI apis have been changed
        //     {
        //         "match": {
        //             "location_details.type.keyword": "pan"
        //         }
        //     },
        //     {
        //         "geo_shape": {
        //             "location_details.polygons": {
        //                 "shape": {
        //                     "type": "point",
        //                     "coordinates": [lat, lng]
        //                 }
        //             }
        //         }
        //     }
        // ]
      };

      // Calculate the starting point for the search
      let size = parseInt(searchRequest.limit);
      let page = parseInt(searchRequest.pageNumber);
      const from = (page - 1) * size;

      // Perform the search with pagination parameters
      let queryResults = await client.search({
        query: query_obj,
        from: from,
        size: size,
      });

      // Extract the _source field from each hit
      let sources = queryResults.hits.hits.map((hit) => hit._source);

      // Get the total count of results
      let totalCount = queryResults.hits.total.value;

      // Return the total count and the sources
      return {
        response: {
          count: totalCount,
          data: sources,
          pages: parseInt(totalCount / size),
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async getSellers(searchRequest = {}, targetLanguage = "en") {
    let afterKey;
    let query = {
        bool: {
            must: [{
                match: {
                    "context.domain": searchRequest.domain,
                    "flagged": JSON.parse(searchRequest.flagged.toLowerCase())
                }
            }]
        }
    };
    if (searchRequest.after) {
        afterKey = {
            "context.bpp_id": searchRequest.after
        }
    }

    if (!searchRequest.domain) {
        query.bool.must[0].match["context.domain"] = undefined;
    }
    const allSellersFlagged = await client.search({
        index: 'items',
        query: query,
        size: 0,
        aggs: {
            unique: {
                composite: {
                    after: afterKey,
                    sources: {
                        "context.bpp_id": {
                            terms: {
                                "field": "context.bpp_id"
                            }
                        }
                    },
                    size: searchRequest.limit
                },
                aggs: {
                    flagged_unique_providers: {
                        cardinality: {
                            field: 'provider_details.id'
                        }
                    },
                    flagged_unique_items: {
                        cardinality: {
                            field: 'item_details.id'
                        }
                    }
                }
            }
        }

    });
    query = undefined
    const allSellers = await client.search({
        index: 'items',
        query: query,
        size: 0,
        aggs: {
            unique: {

                composite: {
                    after: afterKey,
                    sources: {
                        "context.bpp_id": {
                            terms: {
                                "field": "context.bpp_id"
                            }
                        }
                    },
                    size: searchRequest.limit
                },
                aggs: {
                    unique_providers: {
                        cardinality: {
                            field: 'provider_details.id'
                        }
                    },
                    unique_items: {
                        cardinality: {
                            field: 'item_details.id'
                        }
                    }
                }
            }
        }

    });

    const {
        buckets
    } = allSellers.aggregations.unique;

    const { buckets : flaggedBuckets } = allSellersFlagged.aggregations.unique;
    const grouped = _.groupBy(buckets, item => item.key["context.bpp_id"]);
    const flaggedGrouped = _.groupBy(flaggedBuckets, item => item.key["context.bpp_id"]);
    
    const result = _.map(grouped, (group, key) => { 
      return {
            bpp_id: key,
            item_count: group[0].unique_items.value,
            provider_count: group[0].unique_providers.value,
            flagged_items_count: flaggedGrouped[key] && flaggedGrouped[key][0]?.flagged_unique_items?.value || 0,
            flagged_providers_count: flaggedGrouped[key] && flaggedGrouped[key][0]?.flagged_unique_providers?.value || 0 
        }
    });
    
    return {
        sellers: result,
        _after: allSellers.aggregations.unique.after_key["context.bpp_id"]
    };

  }


  async globalSearchItems(searchRequest = {}, targetLanguage = "en") {
    try {
      // providerIds=ondc-mock-server-dev.thewitslab.com_ONDC:RET10_ondc-mock-server-dev.thewitslab.com
      let matchQuery = [];
      let searchQuery = [];

      // bhashini translated data
      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      if (searchRequest.name) {
        matchQuery.push({
          match: {
            "item_details.descriptor.name": searchRequest.name,
          },
        });
        searchQuery.push({
          match: {
            "item_details.descriptor.short_desc": searchRequest.name,
          },
        });
        searchQuery.push({
          match: {
            "item_details.descriptor.long_desc": searchRequest.name,
          },
        });
        searchQuery.push({
          match: {
            "item_details.category_id": searchRequest.name,
          },
        });
      }

      if (searchRequest.providerIds) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.providerIds,
          },
        });
      }

      if (searchRequest.categoryIds) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.categoryIds,
          },
        });
      }

      // for variants we set is_first = true
      matchQuery.push({
        match: {
          is_first: true,
        },
      });

      searchQuery.push({
        match: {
          "location_details.type.keyword": "pan",
        },
      });

      if (searchRequest.latitude && searchRequest.longitude)
        searchQuery.push({
          geo_shape: {
            "location_details.polygons": {
              shape: {
                type: "point",
                coordinates: [
                  parseFloat(searchRequest.latitude),
                  parseFloat(searchRequest.longitude),
                ],
              },
            },
          },
        });

      let query_obj = {
        bool: {
          must: matchQuery,
          should: searchQuery,
        },
      };

      // Calculate the starting point for the search
      let size = parseInt(searchRequest.limit);
      let page = parseInt(searchRequest.pageNumber);
      const from = (page - 1) * size;

      console.log(query_obj);
      // Perform the search with pagination parameters
      let queryResults = await client.search({
        query: query_obj,
        sort: [
          {
            _score: {
              order: "desc",
            },
          },
        ],
        from: from,
        size: size,
      });

      // Extract the _source field from each hit
      let sources = queryResults.hits.hits.map((hit) => hit._source);

      // Get the total count of results
      let totalCount = queryResults.hits.total.value;

      // Return the total count and the sources
      return {
          count: totalCount,
          data: sources,
          pages: parseInt(Math.round(totalCount / size)),
      };
    } catch (err) {
      throw err;
    }
  }

  async getProvideDetails(searchRequest = {}, targetLanguage = "en") {
    try {
      // id=pramaan.ondc.org/alpha/mock-server_ONDC:RET12_pramaan.ondc.org/alpha/mock-server
      let matchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      if (searchRequest.id) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.id,
          },
        });
      }

      let query_obj = {
        bool: {
          must: matchQuery,
        },
      };

      let queryResults = await client.search({
        query: query_obj,
      });

      console.log(queryResults);

      let provider_details = null;
      if (queryResults.hits.hits.length > 0) {
        let details = queryResults.hits.hits[0]._source; // Return the source of the first hit
        provider_details = {
          domain: details.context.domain,
          ...details.provider_details,
        };
      }

      return provider_details;
    } catch (err) {
      throw err;
    }
  }

  async getLocationDetails(searchRequest = {}, targetLanguage = "en") {
    try {
      // providerIds=ondc-mock-server-dev.thewitslab.com_ONDC:RET10_ondc-mock-server-dev.thewitslab.com
      let matchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      if (searchRequest.id) {
        matchQuery.push({
          match: {
            "location_details.id": searchRequest.id,
          },
        });
      }

      let query_obj = {
        bool: {
          must: matchQuery,
        },
      };

      let queryResults = await client.search({
        query: query_obj,
      });

      let location_details = null;
      if (queryResults.hits.hits.length > 0) {
        let details = queryResults.hits.hits[0]._source; // Return the source of the first hit
        location_details = {
          domain: details.context.domain,
          provider_descriptor: details.provider_details.descriptor,
          ...details.location_details,
        };
      }

      return location_details;
    } catch (err) {
      throw err;
    }
  }

  async getItemDetails(searchRequest = {}, targetLanguage = "en", errorTags = []) {
    try {
      // providerIds=ondc-mock-server-dev.thewitslab.com_ONDC:RET10_ondc-mock-server-dev.thewitslab.com
      let matchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      if (searchRequest.id) {
        matchQuery.push({
          match: {
            id: searchRequest.id,
          },
        });
      }

      let query_obj = {
        bool: {
          must: matchQuery,
        },
      };

      let queryResults = await client.search({
        query: query_obj,
      });

      let item_details = null;
      let indexName = null; // Initialize a variable to store the index name
      if (queryResults.hits.hits.length > 0) {
        item_details = queryResults.hits.hits[0]._source; // Return the source of the first hit
        indexName = queryResults.hits.hits[0]._index; // Get the index name from the first hit
        console.log("Index Name", indexName);
        item_details.customisation_items = [];
        item_details.errorTags = errorTags; // Add errorTags from params

        // Check for ImageMissing
        if (!item_details.item_details.descriptor.images || item_details.item_details.descriptor.images.length === 0) {
          if (!errorTags.includes('ImageMissing')) {
            errorTags.push('ImageMissing');
          }
        }

        //Check for NameMissing
        if(!item_details.item_details.descriptor.name){
          if(!errorTags.includes('NameMissing')){
            errorTags.push('NameMissing')
          }
        }

        // add variant details if available
        if (item_details.item_details.parent_item_id) {
          // hit db to find all related items
          let matchQuery = [];

          matchQuery.push({
            match: {
              language: targetLanguage,
            },
          });

          matchQuery.push({
            match: {
              "item_details.parent_item_id":
                item_details.item_details.parent_item_id,
            },
          });

          // match provider id
          matchQuery.push({
            match: {
              "provider_details.id": item_details.provider_details.id,
            },
          });

          // match location id
          matchQuery.push({
            match: {
              "location_details.id": item_details.location_details.id,
            },
          });

          let query_obj = {
            bool: {
              must: matchQuery,
            },
          };

          let queryResults = await client.search({
            query: query_obj,
          });

          item_details.related_items = queryResults.hits.hits.map(
            (hit) => hit._source,
          );
        } else if (item_details.customisation_groups.length > 0) {
          //fetch all customisation items - customisation_group_id
          let customisationQuery = [];
          let groupIds = item_details.customisation_groups.map((data) => {
            return data.id;
          });

          console.log("groupids---->", groupIds);
          customisationQuery.push({
            terms: {
              customisation_group_id: groupIds,
            },
          });

          // Add the match query for type
          customisationQuery.push({
            match: {
              type: "customization",
            },
          });
          // Create the query object
          let query_obj = {
            bool: {
              must: customisationQuery,
            },
          };

          let queryResults = await client.search({
            query: query_obj,
          });

          console.log(queryResults);
          item_details.customisation_items = queryResults.hits.hits.map(
            (hit) => hit._source,
          );
        }
        // Save the item details back to Elasticsearch with errorTags
        let savedRes = await client.index({
            index: indexName, // Use the dynamically retrieved index name
            id: item_details.id,
            body: item_details,
        });

        console.log('SAVED RESPONSE', savedRes);

        // Retrieve all items where errorTags include 'ImageMissing', 'NameMissing'
        let errorTagQuery = {
            bool: {
                must: [
                    {
                        terms: {
                            "errorTags": ["ImageMissing", "NameMissing"]
                        }
                    }
                ]
            }
        };

        let errorTagResults = await client.search({
            index: indexName, // Use the dynamically retrieved index name
            query: errorTagQuery,
        });

        let itemsWithImageMissing = errorTagResults.hits.hits.map((hit) => hit._source);
        console.log("Items With Image Missing:", itemsWithImageMissing);
      }

      //            console.log("itemdetails--->",item_details)
      return item_details;

      // TODO: attach related items
      // TODO: attach customisations
    } catch (err) {
      throw err;
    }
  }

  async getAttributes(searchRequest) {
    try {
      let matchQuery = [];

      if (searchRequest.category) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.category,
          },
        });
      }

      if (searchRequest.provider) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.provider,
          },
        });
      }

      const response = await client.search({
        size: 0, // We don't need the actual documents, just the aggregation results
        body: {
          query: {
            bool: {
              must: matchQuery,
            },
          },
          aggs: {
            unique_keys: {
              scripted_metric: {
                init_script: "state.keys = new HashSet();",
                map_script: `
              for (entry in params._source.attributes.entrySet()) {
                state.keys.add(entry.getKey());
              }
            `,
                combine_script: "return state.keys;",
                reduce_script: `
              Set uniqueKeys = new HashSet();
              for (state in states) {
                uniqueKeys.addAll(state);
              }
              return uniqueKeys;
            `,
              },
            },
          },
        },
      });

      // Extract the unique keys from the aggregation results
      const uniqueKeys = Array.from(response.aggregations.unique_keys.value);

      const keyObjects = uniqueKeys.map((key) => ({ code: key }));
      return { response: { data: keyObjects, count: 1, pages: 1 } };
    } catch (err) {
      throw err;
    }
  }

  async getAttributesValues(searchRequest) {
    try {
      let matchQuery = [];

      if (searchRequest.category) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.category,
          },
        });
      }

      if (searchRequest.provider) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.provider,
          },
        });
      }

      const response = await client.search({
        body: {
          query: {
            bool: {
              must: matchQuery,
            },
          },
          size: 0,
          aggs: {
            unique_values: {
              terms: {
                field: `attributes.${searchRequest.attribute_code}.keyword`, // Aggregation by 'Color' attribute
                //          size: 10 // Adjust 'size' based on how many unique values you expect
              },
            },
          },
        },
      });
      console.log(response);

      const uniqueValues = response.aggregations.unique_values.buckets.map(
        (bucket) => bucket.key,
      );
      //    console.log(body.hits.hits); // Print the matching documents
      // Extract and return the hits (documents)
      return { response: { data: uniqueValues, count: uniqueValues.length } }; //.body.hits.hits;
    } catch (err) {
      throw err;
    }
  }

  async getLocations(searchRequest, targetLanguage = "en") {
    try {

     let matchQuery = []

     if(searchRequest.domain){
      matchQuery.push(            {
                                    match: {
                                      "context.domain": searchRequest.domain,
                                    },
                                  },)
     }

     //default language search
     matchQuery.push(            {
      match: {
        language: targetLanguage,
      },
    },)

      // Geo distance filter
      let geoDistanceFilter = {
        geo_distance: {
          distance: '50km',
          "location_details.gps": {
            lat: parseFloat(searchRequest.latitude),
            lon: parseFloat(searchRequest.longitude),
          },
        },
      };

      let query_obj = {
        bool: {
          must: matchQuery,
          filter: [geoDistanceFilter],
          should: [
            //TODO: enable this once UI apis have been changed
            {
              match: {
                "location_details.type.keyword": "pan",
              },
            },
            {
              geo_shape: {
                "location_details.polygons": {
                  shape: {
                    type: "point",
                    coordinates: [
                      parseFloat(searchRequest.latitude),
                      parseFloat(searchRequest.longitude),
                    ],
                  },
                },
              },
            },
          ],
        },
      };
      // Define the aggregation query
      let aggr_query = {
        unique_location: {
          composite: {
            size: searchRequest.limit,
            sources: [
              { location_id: { terms: { field: "location_details.id" } } }
            ],
            after: searchRequest.afterKey ? { location_id: searchRequest.afterKey } : undefined
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
              }
            }
          }
        },
        unique_location_count: {
          cardinality: {
            field: "location_details.id"
          }
        }
      };
  
      // Perform the search query with the defined query and aggregation
      let queryResults = await client.search({
        body: {
          query: query_obj,
          sort: [
            {
              _geo_distance: {
                "location_details.gps": {
                  lat: parseFloat(searchRequest.latitude),
                  lon: parseFloat(searchRequest.longitude),
                },
                order: "asc",
                unit: "km",
                mode: "min",
                distance_type: "arc",
                ignore_unmapped: true
              },
            },
          ],
          aggs: aggr_query,
          size: 0
        }
      });
  
      // Extract unique providers from the aggregation results
      let unique_location = queryResults.aggregations.unique_location.buckets.map(bucket => {

        const details = bucket.products.hits.hits.map((hit) => hit._source)[0];
        return ({
          domain: details.context.domain,
          provider_descriptor: details.provider_details.descriptor,
          provider: details.provider_details.id,
          ...details.location_details,
        });

        // return {...bucket.products.hits.hits[0]._source.location_details};
      });
  
      // Get the unique provider count
      let totalCount = queryResults.aggregations.unique_location_count.value;
      let totalPages = Math.ceil(totalCount / searchRequest.limit);
  
      // Get the after key for pagination
      let afterKey = queryResults.aggregations.unique_location.after_key;
  
      // Return the response with count, data, afterKey, and pages
      return {
          count: totalCount,
          data: unique_location,
          afterKey: afterKey,
          pages: totalPages,
      };
  
    } catch (err) {
      throw err;
    }
  }

  async getGlobalProviders(searchRequest, targetLanguage = "en") {
    try {
      console.log("searchRequest", searchRequest);
  
      // Define the query object with additional filters on names
      let query_obj = {
        bool: {
          must: [
            {
              bool: {
                should: [
                  {
                    regexp: {
                      "item_details.descriptor.name": {
                        value: `.*${searchRequest.name}.*`,
                        case_insensitive: true,
                      },
                    },
                  },
                  {
                    regexp: {
                      "provider_details.descriptor.name": {
                        value: `.*${searchRequest.name}.*`,
                        case_insensitive: true,
                      },
                    },
                  },
                ],
              },
            },
                 //default language search
       {
      match: {
        language: targetLanguage,
      },
    },
            {
              bool: {
                should: [
                  {
                    match: {
                      "location_details.type.keyword": "pan",
                    },
                  },
                  {
                    geo_shape: {
                      "location_details.polygons": {
                        shape: {
                          type: "point",
                          coordinates: [
                            parseFloat(searchRequest.latitude),
                            parseFloat(searchRequest.longitude),
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      };
      // Define the aggregation query
      let aggr_query = {
        unique_providers: {
          composite: {
            size: searchRequest.limit,
            sources: [
              { provider_id: { terms: { field: "provider_details.id" } } }
            ],
            after: searchRequest.afterKey ? { provider_id: searchRequest.afterKey } : undefined
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
              }
            }
          }
        },
        unique_provider_count: {
          cardinality: {
            field: "provider_details.id"
          }
        }
      };
  
      // Perform the search query with the defined query and aggregation
      let queryResults = await client.search({
        body: {
          query: query_obj,
          aggs: aggr_query,
          size: 0
        }
      });
  
      // Extract unique providers from the aggregation results
      let unique_providers = queryResults.aggregations.unique_providers.buckets.map(bucket => {
        return {...bucket.products.hits.hits[0]._source.provider_details,items:bucket.products.hits.hits.map((hit) => hit._source)};
      });
  
      // Get the unique provider count
      let totalCount = queryResults.aggregations.unique_provider_count.value;
      let totalPages = Math.ceil(totalCount / searchRequest.limit);
  
      // Get the after key for pagination
      let afterKey = queryResults.aggregations.unique_providers.after_key;
  
      // Return the response with count, data, afterKey, and pages
      return {
        response: {
          count: totalCount,
          data: unique_providers,
          afterKey: afterKey,
          pages: totalPages,
        }
      };
  
    } catch (err) {
      throw err;
    }
  }

  async getProviders(searchRequest, targetLanguage = "en") {
    try {
      console.log("searchRequest",searchRequest)
      let query_obj = {
        bool: {
          // Add your actual query conditions here
        }
      };
  
      let aggr_query = {
        unique_providers: {
          composite: {
            size: searchRequest.limit,
            sources: [
              { provider_id: { terms: { field: "provider_details.id" } } }
            ],
            after: searchRequest.afterKey?{provider_id:searchRequest.afterKey}:undefined
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
              }
            }
          }
        },
        unique_provider_count: {
          cardinality: {
            field: "provider_details.id"
          }
        }
      };
  
      let queryResults = await client.search({
        body: {
          query: query_obj,
          aggs: aggr_query,
          size: 0
        }
      });
  
      let unique_providers = queryResults.aggregations.unique_providers.buckets.map(bucket => {
        return bucket.products.hits.hits[0]._source.provider_details;
      });
  
      let totalCount = queryResults.aggregations.unique_provider_count.value;
      let totalPages = Math.ceil(totalCount / searchRequest.limit);
  
      let afterKey = queryResults.aggregations.unique_providers.after_key;
  
      return {
        response: {
          count: totalCount,
          data: unique_providers,
          afterKey: afterKey,
          pages: totalPages
        }
      };
  
    } catch (err) {
      throw err;
    }
  }

  async getCustomMenu(searchRequest, targetLanguage = "en") {
    try {
      let matchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      if (searchRequest.provider) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.provider,
          },
        });
      }

      let queryResults = await client.search({
        query: {
          bool: {
            must: [
              {
                term: {
                  "provider_details.id": searchRequest.provider,
                },
              },
            ],
          },
        },
        aggs: {
          unique_menus: {
            nested: {
              path: "customisation_menus",
            },
            aggs: {
              filtered_menus: {
                terms: {
                  field: "customisation_menus.id",
                },
                aggs: {
                  menu_details: {
                    top_hits: {
                      size: 1,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let customisationMenus = [];
      const buckets =
        queryResults.aggregations.unique_menus.filtered_menus.buckets;

      buckets.forEach((bucket) => {
        const menuDetails = bucket.menu_details.hits.hits.map(
          (hit) => hit._source,
        )[0];
        customisationMenus.push(menuDetails);
      });
      console.log("Unique IDs with documents:", customisationMenus);
      return {
        data: customisationMenus,
        count: customisationMenus.length,
        pages: customisationMenus.length,
      };
    } catch (err) {
      throw err;
    }
  }

  async flagSeller(searchRequest, targetLanguage="en"){
    if (!_.isBoolean(searchRequest.flagged)){
      throw new Error("Flag can only be boolean type");
    }

    let key;
    switch(searchRequest.type){
      case "seller":
        key = "context.bpp_id"
        break;
      case "item":
        key = "item_details.id"
        break;
      case "provider":
        key = "provider_details.id"
    }
    const searchResults = await client.updateByQuery({
      index: 'items',
      query: {
        term: {
          [key]: searchRequest.id
        }
      },
      "script": { "inline": `ctx._source.flagged = ${searchRequest.flagged}`}
    });

    return searchResults;
    
  }


  async  getOffers(searchRequest, targetLanguage = "en") {
    try {
      let matchQuery = [];
      let searchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      searchQuery.push({
        match: {
          "location_details.type.keyword": "pan",
        },
      });

      if (searchRequest.latitude && searchRequest.longitude)
        searchQuery.push({
          geo_shape: {
            "location_details.polygons": {
              shape: {
                type: "point",
                coordinates: [
                  parseFloat(searchRequest.latitude),
                  parseFloat(searchRequest.longitude),
                ],
              },
            },
          },
        });

      if (searchRequest.provider) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.provider,
          },
        });
      }
      if (searchRequest.location) {
        matchQuery.push({
          match: {
            "location_details.id": searchRequest.location,
          },
        });
      }
      let queryResults = await client.search({
        index:'offers',
        query: {
          bool: {
            must:matchQuery,
            should:searchQuery
          },
        },
        size:20
      });

      // Extract the _source field from each hit
      let sources = queryResults.hits.hits.map((hit) => {
        return {...hit._source,provider:hit._source.provider_details.id,provider_descriptor:hit._source.provider_details.descriptor,location:hit._source.location_details.id,domain:hit._source.context.domain,id:hit._source.local_id};
        });

      // Get the total count of results
      let totalCount = queryResults.hits.total.value;

      // Return the total count and the sources
      return {
        response: {
          count: totalCount,
          data: sources,
        },
      };


    } catch (err) {
      throw err;
    }
  }

  async listProviders(searchRequest = {}, targetLanguage = "en") {
    try {
      let matchQuery = [];

      // Filter by target language
      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      // Add search filters based on provided searchRequest
      if (searchRequest.name) {
        matchQuery.push({
          match: {
            "item_details.descriptor.name": searchRequest.name,
          },
        });
      }

      if (searchRequest.providerIds) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.providerIds,
          },
        });
      }

      if (searchRequest.categoryIds) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.categoryIds,
          },
        });
      }

      if (searchRequest.bpp_id) {
        matchQuery.push({
          match: {
            "context.bpp_id": searchRequest.bpp_id,
          },
        });
      }

      if (searchRequest.city) {
        matchQuery.push({
          match: {
            "context.city": searchRequest.city,
          },
        });
      }

      if (searchRequest.domain) {
        matchQuery.push({
          match: {
            "context.domain": searchRequest.domain,
          },
        });
      }

      // Add a filter for variants
      matchQuery.push({
        match: {
          is_first: true,
        },
      });

      // Add flag filter
      if (searchRequest.flag !== undefined) {
        matchQuery.push({
          match: {
            flagged: searchRequest.flag,
          },
        });
      }

      // Construct the query object
      let query_obj = {
        bool: {
          must: matchQuery,
        },
      };

      // Calculate pagination parameters
      let size = parseInt(searchRequest.limit);
      let page = parseInt(searchRequest.pageNumber);
      const from = (page - 1) * size;

      // Perform the search with pagination and aggregations
      let queryResults = await client.search({
        index: 'items',
        body: {
          query: query_obj,
          from: from, // Fetch all results initially, pagination will be handled manually
          size: size,
          aggs: {
            unique_provider_location: {
              composite: {
                size: size, // Number of results to return per page
                sources: [
                  { provider_id: { terms: { field: "provider_details.id" } } },
                  { location_id: { terms: { field: "location_details.id" } } }
                ],
                after: searchRequest.afterKey ? { provider_id: searchRequest.afterKey.provider_id, location_id: searchRequest.afterKey.location_id } : undefined
              },
              aggs: {
                item_count: {
                  cardinality: {
                    field: 'item_details.id'
                  }
                }, // Count items for each provider-location combination
                flagged_count: { filter: { term: { flagged: true } } }, 
                top_hits: { top_hits: { size: 1 } } // Get top hit for additional details
              }
            }
          }
        },
      });

      // Extract the provider data and aggregations
      let providers = queryResults.aggregations.unique_provider_location.buckets.flatMap((bucket) => {
        const itemCount = bucket.item_count.value;
        const flaggedItemCount = bucket.flagged_count.doc_count;
        const topHit = bucket.top_hits.hits.hits[0]?._source; // Safely accessing top_hits

        if (!topHit) {
          return null; // Skip if topHit is undefined
        }
        console.log("BUCKET", bucket);
        const locationId = bucket.key.location_id;

        return {
          name: topHit.context.bpp_id, // BPP ID as name
          provider: topHit.provider_details.descriptor.name, // Provider name
          city: topHit.location_details.address.city,
          seller_app: topHit.context.bpp_id, // Seller app
          item_count: itemCount, // Number of items
          flagged_item_count: flaggedItemCount,
          location_id: locationId, // Location ID
        };
      }).filter(provider => provider !== null); // Filter out null values

      // Return the total count and the sources
      return {
        response: {
          count: providers.length,
          data: providers,
          pages: Math.ceil(providers.length / size), // Calculate the total number of pages
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async displayItems(searchRequest = {}, targetLanguage = "en") {
    try {
      let matchQuery = [];

      // Match for target language
      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      // Apply additional filters as per searchRequest
      if (searchRequest.name) {
        matchQuery.push({
          match: {
            "item_details.descriptor.name": searchRequest.name,
          },
        });
      }

      if (searchRequest.providerIds) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.providerIds,
          },
        });
      }

      if (searchRequest.categoryIds) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.categoryIds,
          },
        });
      }

      if (searchRequest.bpp_id) {
        matchQuery.push({
          match: {
            "context.bpp_id": searchRequest.bpp_id,
          },
        });
      }

      if (searchRequest.city) {
        matchQuery.push({
          match: {
            "context.city": searchRequest.city,
          },
        });
      }

      if (searchRequest.domain) {
        matchQuery.push({
          match: {
            "context.domain": searchRequest.domain,
          },
        });
      }

      // Ensure only first items are considered
      matchQuery.push({
        match: {
          is_first: false,
        },
      });

      // Add flag filter
      if (searchRequest.flag !== undefined) {
        matchQuery.push({
          match: {
            flagged: searchRequest.flag,
          },
        });
      }

      let query_obj = {
        bool: {
          must: matchQuery,
        },
      };

      // Calculate pagination parameters
      let size = parseInt(searchRequest.limit);
      let page = parseInt(searchRequest.pageNumber);
      const from = (page - 1) * size;

      // Elasticsearch query with aggregation
      let queryResults = await client.search({
        index: 'items',
        body: {
          query: query_obj,
          from: from,
          size: size,
          _source: [
            'item_details.id',
            'context.bpp_id',
            'provider_details.descriptor.name',
            'item_details.descriptor.name',
            'item_details.descriptor.images',
            'item_details.price.value',
            'item_details.quantity.available.count'
          ],
        },
      });

      // Extract data from Elasticsearch response
      let items = queryResults.hits.hits.map((hit) => ({
        item_id: hit._source.item_details.id,
        seller_app: hit._source.context.bpp_id,
        provider_name: hit._source.provider_details.descriptor.name,
        name: hit._source.context.bpp_id,
        images: hit._source.item_details.descriptor.images,
        price: hit._source.item_details.price.value,
        quantity: hit._source.item_details.quantity.available.count
      }));

      // Get the total count of results
      let totalCount = queryResults.hits.total.value;

      // Return the total count and the items data
      return {
        response: {
          count: totalCount,
          data: items,
          pages: Math.ceil(totalCount / size),
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async addItemErrorTags(items) {
    try {
      if (!Array.isArray(items) || items.length === 0) {
        throw new NoRecordFoundError('Invalid input: items should be a non-empty array.');
      }
  
      const bulkResponse = [];
  
      for (const item of items) {
        const { itemId, itemErrorTags } = item;
  
        if (!itemId || !Array.isArray(itemErrorTags)) {
          throw new BadRequestParameterError('Invalid input: itemId should be a string and itemErrorTags should be an array.');
        }
  
        const updateQuery = {
          script: {
            source: `
              if (ctx._source.itemErrorTags == null) {
                ctx._source.itemErrorTags = [];
              }
              for (tag in params.itemErrorTags) {
                ctx._source.itemErrorTags.add(tag);
              }
            `,
            params: {
              itemErrorTags: itemErrorTags
            }
          },
          query: {
            term: {
              id: itemId
            }
          }
        };
  
        const response = await client.updateByQuery({
          index: 'items',
          body: updateQuery,
          conflicts: 'proceed'
        });
  
        bulkResponse.push(response);
      }
  
      return bulkResponse;
  
    } catch (err) {
      throw err;
    }
  }

  async addProviderErrorTags(items) {
    try {
      if (!Array.isArray(items) || items.length === 0) {
        throw new NoRecordFoundError('Invalid input: items should be a non-empty array.');
      }
  
      const bulkResponse = [];
  
      for (const item of items) {
        const { providerId, providerErrorTags } = item;
  
        if (!providerId || !Array.isArray(providerErrorTags)) {
          throw new BadRequestParameterError('Invalid input: providerId should be a string and providerErrorTags should be an array.');
        }
  
        const updateQuery = {
          script: {
            source: `
              if (ctx._source.providerErrorTags == null) {
                ctx._source.providerErrorTags = [];
              }
              for (tag in params.providerErrorTags) {
                ctx._source.providerErrorTags.add(tag);
              }
            `,
            params: {
              providerErrorTags: providerErrorTags
            }
          },
          query: {
            term: {
              "provider_details.id": providerId
            }
          }
        };
  
        const response = await client.updateByQuery({
          index: 'items',
          body: updateQuery,
        });
  
        bulkResponse.push(response);
      }
  
      return bulkResponse;
  
    } catch (err) {
      throw err;
    }
  }

  async addSellerErrorTags(items) {
    try {
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Invalid input: items should be a non-empty array.');
      }
  
      const bulkResponse = [];
  
      for (const item of items) {
        const { sellerId, sellerErrorTags } = item;
  
        if (!sellerId || !Array.isArray(sellerErrorTags)) {
          throw new Error('Invalid input: sellerId should be a string and sellerErrorTags should be an array.');
        }
  
        const updateQuery = {
          script: {
            source: `
              if (ctx._source.sellerErrorTags == null) {
                ctx._source.sellerErrorTags = [];
              }
              for (tag in params.sellerErrorTags) {
                ctx._source.sellerErrorTags.add(tag);
              }
            `,
            params: {
              sellerErrorTags: sellerErrorTags
            }
          },
          query: {
            term: {
              "context.bpp_id": sellerId
            }
          }
        };
  
        const response = await client.updateByQuery({
          index: 'items',
          body: updateQuery,
          conflicts: 'proceed'
        });
  
        bulkResponse.push(response);
      }
  
      return bulkResponse;
  
    } catch (err) {
      throw err;
    }
  }
}

export default SearchService;