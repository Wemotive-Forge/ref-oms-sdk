import _ from "lodash";
import client from "../../database/elasticSearch.js";
import MappedCity from "../../utils/mappedCityCode.js";

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
    let matchQuery = [];

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

    if (searchRequest.afterKey) {
      afterKey = {
        "context.bpp_id": searchRequest.afterKey,
      };
    }

    if (searchRequest.autoFlag){
      matchQuery.push({
        match: {
          "auto_seller_flag": searchRequest.autoFlag,
        },
      });
    }

    if (searchRequest.manualFlag){
      matchQuery.push({
        match: {
          "manual_seller_flag": searchRequest.manualFlag,
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
    let query_obj = {
      bool: {
        must: matchQuery,
      },
    };

    
    const allSellers = await client.search({
      index: "items",
      query: query_obj,
      size: 0,
      aggs: {
        seller_count: {
          cardinality: {
            field: "context.bpp_id",
          },
        },
        unique: {
          composite: {
            after: afterKey,
            sources: {
              "context.bpp_id": {
                terms: {
                  field: "context.bpp_id",
                },
              },
            },
            size: searchRequest.limit,
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
                _source: ["bpp_details.bpp_id", "bpp_details.name"],
              },
            },
            provider_count: {
              cardinality: {
                field: "provider_details.id",
              },
            },
            seller_flag_count: {
              filter: {
                term: {
                  seller_flag: true,
                },
              },
            },
            manual_seller_flag_count: {
              filter: {
                term: {
                  manual_seller_flag: true,
                },
              },
            },
            auto_seller_flag_count: {
              filter: {
                term: {
                  auto_seller_flag: true,
                },
              },
            },
            provider_flagged_count: {
              filter: {
                term: {
                  provider_flag: true,
                },
              },
            },
            item_count: {
              cardinality: {
                field: "item_details.id",
              },
            },
            item_flagged_count: {
              filter: {
                term: {
                  item_flag: true,
                },
              },
            },
          },
        },
      },
    });

    const { buckets } = allSellers.aggregations.unique;

    if (buckets.length === 0)
      return

    const grouped = _.groupBy(buckets, (item) => item.key["context.bpp_id"]);

    const result = _.map(grouped, (group, key) => {
      return {
        bpp_id: key,
        seller_name: group[0].products.hits.hits[0]._source.bpp_details.name,
        item_count: group[0].item_count.value,
        provider_count: group[0].provider_count.value,
        flagged_items_count: group[0].item_flagged_count.doc_count,
        flagged_providers_count: group[0].provider_flagged_count.doc_count,
        flag: group[0].seller_flag_count.doc_count > 0,
        manual_flag: group[0].manual_seller_flag_count.doc_count > 0,
        auto_flag: group[0].auto_seller_flag_count.doc_count > 0,
      };
    });

    return {
      sellers: result,
      count: allSellers.aggregations.seller_count.value,
      afterKey: allSellers.aggregations.unique.after_key["context.bpp_id"],
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

  async getItemDetails(searchRequest = {}, targetLanguage = "en") {
    try {
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
      if (queryResults.hits.hits.length > 0) {
        item_details = queryResults.hits.hits[0]._source; // Return the source of the first hit
        item_details.customisation_items = [];

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

          matchQuery.push(
            {
              match: {
                language: targetLanguage,
              },
            })

          let query_obj = {
            bool: {
              must: matchQuery,
            },
          };

          let queryResults = await client.search({
            query: query_obj,
            size:100
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

          customisationQuery.push(
            {
              match: {
                language: targetLanguage,
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
            size: 100
          });

          console.log(queryResults);
          item_details.customisation_items = queryResults.hits.hits.map(
            (hit) => hit._source,
          );
        }
      }

      item_details.locations = [item_details.location_details]
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
        (bucket) => bucket.key
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
      let matchQuery = [];

      if (searchRequest.domain) {
        matchQuery.push({
          match: {
            "context.domain": searchRequest.domain,
          },
        });
      }

      //default language search
      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      // Geo distance filter
      let geoDistanceFilter = {
        geo_distance: {
          distance: "50km",
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
              { location_id: { terms: { field: "location_details.id" } } },
            ],
            after: searchRequest.afterKey
              ? { location_id: searchRequest.afterKey }
              : undefined,
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
              },
            },
          },
        },
        unique_location_count: {
          cardinality: {
            field: "location_details.id",
          },
        },
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
                ignore_unmapped: true,
              },
            },
          ],
          aggs: aggr_query,
          size: 0,
        },
      });

      // Extract unique providers from the aggregation results
      let unique_location =
        queryResults.aggregations.unique_location.buckets.map((bucket) => {
          const details = bucket.products.hits.hits.map(
            (hit) => hit._source
          )[0];
          return {
            domain: details.context.domain,
            provider_descriptor: details.provider_details.descriptor,
            provider: details.provider_details.id,
            ...details.location_details,
          };

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
              { provider_id: { terms: { field: "provider_details.id" } } },
            ],
            after: searchRequest.afterKey
              ? { provider_id: searchRequest.afterKey }
              : undefined,
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
              },
            },
          },
        },
        unique_provider_count: {
          cardinality: {
            field: "provider_details.id",
          },
        },
      };

      // Perform the search query with the defined query and aggregation
      let queryResults = await client.search({
        body: {
          query: query_obj,
          aggs: aggr_query,
          size: 0,
        },
      });

      // Extract unique providers from the aggregation results
      let unique_providers =
        queryResults.aggregations.unique_providers.buckets.map((bucket) => {
          return {
            ...bucket.products.hits.hits[0]._source.provider_details,
            items: bucket.products.hits.hits.map((hit) => hit._source),
          };
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
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async getProviders(searchRequest, targetLanguage = "en") {
    try {
      console.log("searchRequest", searchRequest);
      let query_obj = {
        bool: {
          
        },
      };

      let aggr_query = {
        unique_providers: {
          composite: {
            size: searchRequest.limit,
            sources: [
              { provider_id: { terms: { field: "provider_details.id" } } },
            ],
            after: searchRequest.afterKey
              ? { provider_id: searchRequest.afterKey }
              : undefined,
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
              },
            },
          },
        },
        unique_provider_count: {
          cardinality: {
            field: "provider_details.id",
          },
        },
      };

      let queryResults = await client.search({
        body: {
          query: query_obj,
          aggs: aggr_query,
          size: 0,
        },
      });

      let unique_providers =
        queryResults.aggregations.unique_providers.buckets.map((bucket) => {
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
          pages: totalPages,
        },
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
          (hit) => hit._source
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

  async getFlag(searchRequest,  targetLanguage = "en") {
    let source = [];
    let key;
    switch (searchRequest.type) {
      case "seller":
        key = "context.bpp_id";
        source.push("seller_error_tags", "seller_flag","manual_seller_flag", "auto_seller_flag");
        break;
      case "item":
        key = "id";
        source.push("item_error_tags", "item_flag","manual_item_flag", "auto_item_flag");
        break;
      case "provider":
        key = "provider_details.id";
        source.push("provider_error_tags", "provider_flag","manual_provider_flag", "auto_provider_flag");
        break;
      default:
        return { error: "Type must be from ['item', 'seller', 'provider']" };
    }
    let matchQuery = [];

    matchQuery.push({
      match: {
        language: targetLanguage,
      },
    });

    matchQuery.push({
      match: {
        [key]: searchRequest.id,
      },
    });

    let query_obj = {
      bool: {
        must: matchQuery,
      },
    };

    const result = await client.search({
      index: "items",
      _source: source,
      query: query_obj,
    });


    if (result.hits.hits.length === 0) {
      return null;
    }
    if (searchRequest.type === "seller") {
      return [
        {
          flag: result.hits.hits[0]._source[source[1]] || false,
          manual_flag: result.hits.hits[0]._source[source[2]]  || false,
          auto_flag: result.hits.hits[0]._source[source[3]]  || false,
          error_tag: result.hits.hits[0]._source[source[0]] || [],
        },
      ];
    }

    return result.hits.hits.map((hit) => {
      return {
        flag: hit._source[source[1]] || false,
        error_tag: hit._source[source[0]] || [],
      };
    });
  }

  async getUniqueCity(targetLanguage = "en") {
    
    const totalCity = await client.search({
      index: "items",
      size: 0,
      query: { bool: { must: [{ match: { language : targetLanguage }}] } },
      aggs: {
        cityCount: {
          cardinality: {
            field: "context.city",
          },
        },
      },
    });

    if (totalCity.aggregations.cityCount.value === 0)
      return 

    const getCities = await client.search({
      index: "items",
      size: 0,
      aggs: {
        unique: {
          terms: {
            field: "context.city",
            size: totalCity.aggregations.cityCount.value,
          },
        },
      },
    });

    const cityNames = getCities.aggregations.unique.buckets.flatMap(
      (bucket) => {
        const stdCode = bucket.key.replace("std:", "");
        return MappedCity(stdCode);
      }
    );

    return cityNames;
  }

  async updateFlag(searchRequest, targetLanguage = "en") {
    if (!_.isBoolean(searchRequest.flagged)) {
      return { error: "Flag can only be boolean type" };
    }

    let matchQuery = [];


    matchQuery.push({
      match: {
        language: targetLanguage,
      },
    });
    

    let source = `ctx._source.flagged = params.flagged;`;
    let key;
    let manualKey;
    let errorKey;
    switch (searchRequest.type) {
      case "seller":
        manualKey = "manual_seller_flag";
        errorKey = "seller_error_tags";
        key = "context.bpp_id";
        source = `ctx._source.seller_flag = params.flagged; ctx._source.seller_error_tags = params.errorTag; ctx._source.manual_seller_flag = params.flagged;`;
        break;
      case "item":
        manualKey = "manual_item_flag";
        key = "id";
        errorKey = "item_error_tags";
        source = `ctx._source.item_flag = params.flagged; ctx._source.item_error_tags = params.errorTag; ctx._source.manual_item_flag = params.flagged;`;
        break;
      case "provider":
        key = "provider_details.id";
        manualKey = "manual_provider_flag";
        errorKey = "provider_error_tags";
        source = `ctx._source.provider_flag = params.flagged; ctx._source.provider_error_tags = params.errorTag; ctx._source.manual_provider_flag = params.flagged;`;
        break;
      default:
        return { error: "Type must be from ['item', 'seller', 'provider']" };
    }

    matchQuery.push({
      match: {
        [key]: searchRequest.id,
      },
    });

    const query_obj = {
      bool: {
        must: matchQuery,
      }
    }

    const updateResults = await client.updateByQuery({
      index: "items",
      query: query_obj,
      script: {
        source,
        params: {
          flagged: searchRequest.flagged,
          errorTag: searchRequest.flagged ? searchRequest.errorTag : [],
        },
      },
    });

    if (updateResults.total === 0){
      return { error: "No matching documents found" };
    }

    if (updateResults.updated === 0){
      return { error: "Failed to update the documents" };
    }



    const search = await client.search({
      index: "items",
      _source : ["id", "local_id", "provider_details", "location_details", "bpp_details", manualKey , errorKey],
      query: query_obj,
    });

    const bulkBody = []

    search.hits.hits.forEach(item => {
      bulkBody.push({
        index: {
          _index: "manually_flagged_items",
          _id: Date.now(), 
        },
      });

      bulkBody.push({
          id: item._source.id,
          local_id: item._source.local_id,
          created_at: new Date().toISOString(),
          [manualKey]: searchRequest.flagged,
          provider_details: item._source.provider_details,
          location_details: item._source.location_details,
          bpp_details: item._source.bpp_details,
          [errorKey]: searchRequest.errorTag,
      });
    });

    const result = await client.bulk({ refresh: true, body: bulkBody });
    if (result.errors){
      return _.flatMap(result.items, item => ({
        _id: item.index._id,
        status: item.index.status,
        error: item.index.error
      }));
    }

    return _.map(result.items, item => item.index);
  }

  async getOffers(searchRequest, targetLanguage = "en") {
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
        index: "offers",
        query: {
          bool: {
            must: matchQuery,
            should: searchQuery,
          },
        },
        size: 20,
      });

      // Extract the _source field from each hit
      let sources = queryResults.hits.hits.map((hit) => {
        return {
          ...hit._source,
          provider: hit._source.provider_details.id,
          provider_descriptor: hit._source.provider_details.descriptor,
          location: hit._source.location_details.id,
          domain: hit._source.context.domain,
          id: hit._source.local_id,
        };
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

      if (searchRequest.autoFlag){
        matchQuery.push({
          match: {
            "auto_provider_flag": searchRequest.autoFlag,
          },
        });
      }

      if (searchRequest.manualFlag){
        matchQuery.push({
          match: {
            "manual_provider_flag": searchRequest.manualFlag,
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

      if (searchRequest.location_id) {
        matchQuery.push({
          match: {
            "location_details.id": searchRequest.location_id,
          },
        });
      }

      // Add flag filter
      if (searchRequest.flag) {
        matchQuery.push({
          match: {
            provider_flag: searchRequest.flag,
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


      // Perform the search with pagination and aggregations
      const locationProviderFlags = await client.search({
        index: "items",
        size:0,
        query: query_obj,
        aggs: {
          total_providers: {
            cardinality: {
              field : "provider_details.id"
            }
          },
          unique_providers_location: {
            composite: {
              sources:  [
                { provider_id: { terms: { field: "provider_details.id" } } },
              ],
              size: size,
              after: searchRequest.afterKey
                  ? { provider_id: searchRequest.afterKey }
                  : undefined,
            },
            
            aggs: {
              "locations":{
                terms: {field: "location_details.id"},
                aggs: {
                  flagged_count: { filter: { term: { item_flag: true } } },
                  top_hits: { top_hits: { size: 1 } }, // Get top hit for additional details
                }
              },
              "products_without_locations_id": {
                "missing": { "field": "location_details.id" },
                aggs: {
                  flagged_count: { filter: { term: { item_flag: true } } },
                  top_hits: { top_hits: { size: 1 } }, // Get top hit for additional details
                }
              },

            },
          }
        }
      });

      console.log(JSON.stringify(locationProviderFlags))

      if (locationProviderFlags.aggregations.unique_providers_location.buckets.length === 0)
        return

      const response = [];

      locationProviderFlags.aggregations.unique_providers_location.buckets.forEach(bucket => {
          bucket["locations"].buckets.forEach((locationBucket)=>{
          const topHit = locationBucket.top_hits.hits.hits[0]._source;
          response.push ({
            provider_details: topHit.provider_details,
            name: topHit.provider_details.descriptor.name, // BPP ID as name
            city: topHit.context.city,
            seller_name:topHit.bpp_details?.name??"",
            seller_app: topHit.context.bpp_id, // Seller app
            item_count: locationBucket.doc_count, // Number of items
            flagged_item_count: locationBucket.flagged_count.doc_count,
            location_id: locationBucket.key,
            location_details: topHit.location_details,
            location: topHit.location_details.address.locality,
            flag: topHit.provider_flag || false,
            manual_flag : topHit.manual_provider_flag || false,
            auto_flag : topHit.auto_provider_flag || false
          })

          if (bucket["products_without_locations_id"].doc_count > 0){
            const topHit = bucket.products_without_locations_id.top_hits.hits.hits[0]._source;
            response.push ({
              provider_details: topHit.provider_details,
              name: topHit.provider_details.descriptor.name, // BPP ID as name
              city: topHit.context.city,
              seller_name:topHit.bpp_details?.name??"",
              seller_app: topHit.context.bpp_id, // Seller app
              item_count: bucket.products_without_locations_id.doc_count, // Number of items
              flagged_item_count: bucket.products_without_locations_id.flagged_count.doc_count ,
              location_id: "N/A",
              location_details: "N/A",
              location: "N/A",
              flag: topHit.provider_flag || false,
              auto_flag : topHit.auto_provider_flag || false,
              manual_flag : topHit.manual_provider_flag || false,
            })
          }
         
        })
      });


      return {
        response: {
          count: locationProviderFlags.aggregations.total_providers.value,
          data: response,
          pages: Math.ceil(locationProviderFlags.aggregations.total_providers.value / size), 
          afterKey : locationProviderFlags.aggregations.unique_providers_location.after_key.provider_id,
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

      if (searchRequest.autoFlag){
        matchQuery.push({
          match: {
            "auto_item_flag": searchRequest.autoFlag,
          },
        });
      }

      if (searchRequest.manualFlag){
        matchQuery.push({
          match: {
            "manual_item_flag": searchRequest.manualFlag,
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

      if (searchRequest.category) {
        matchQuery.push({
          match: {
            "item_details.category_id": searchRequest.category,
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

      if (searchRequest.location) {
        matchQuery.push({
          match: {
            "location_details.id": searchRequest.location,
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

      // Add flag filter
      if (searchRequest.flagged) {
        matchQuery.push({
          match: {
            item_flag: searchRequest.flagged,
          },
        });
      }

      if (searchRequest.type) {
        matchQuery.push({
          match: {
            type: searchRequest.type,
          },
        });
      }
      // Add customisation filter
      if (searchRequest.customisation !== undefined) {
        if (searchRequest.customisation === "false") {
          // If customisation is set to "false", we want to include items where:
          matchQuery.push({
            bool: {
              should: [
                // 1. "item_details.tags.code" does not exist
                {
                  bool: {
                    must_not: {
                      exists: {
                        field: "item_details.tags.code",
                      },
                    },
                  },
                },
                // 2. "item_details.tags.code" is not "custom_group"
                {
                  bool: {
                    must_not: {
                      term: {
                        "item_details.tags.code": "custom_group",
                      },
                    },
                  },
                },
              ],
            },
          });
        } else {
          // Otherwise, include items where "item_details.tags.code" is "custom_group"
          matchQuery.push({
            match: {
              "item_details.tags.code": "custom_group",
            },
          });
        }
      }
      // Add variant filter
      if (searchRequest.variant !== undefined) {
        matchQuery.push({
          exists: {
            field: "item_details.parent_item_id",
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
        index: "items",
        body: {
          query: query_obj,
          from: from,
          size: size,
          _source: [
            "item_details",
            "id",
            "context.bpp_id",
            "provider_details.descriptor.name",
            "item_details.descriptor.name",
            "item_details.descriptor.images",
            "item_details.price.value",
            "item_details.quantity.available.count",
            "item_details.descriptor.name",
            "item_flag",
            "item_error_tags",
            "bpp_details.name",
            "type",
            "location_details.id",
            "provider_details.id",
            "auto_item_flag",
            "manual_item_flag"
          ],
        },
      });

      // Extract data from Elasticsearch response
      let items = queryResults.hits.hits.map((hit) => {
        const itemDetails = hit._source.item_details;
        const customisation =
          itemDetails.tags?.some((tag) => tag.code === "custom_group") || false;
        const variant = itemDetails.parent_item_id ? true : false;
        const type =
          itemDetails.type === "customisation" ? "customisation" : "item";

        return {
          item_details: itemDetails,
          item_id: hit._source.id,
          item_name: itemDetails.descriptor.name,
          type: type,
          seller_app: hit._source.context.bpp_id,
          seller_name: hit._source.bpp_details.name,
          provider_id: hit._source.provider_details.id,
          location_id: hit._source.location_details?.id,
          provider_name: hit._source.provider_details.descriptor.name,
          images: itemDetails.descriptor.images,
          price: itemDetails.price.value,
          quantity: itemDetails.quantity.available.count,
          flag: hit._source.item_flag || false,
          error_tags: hit._source.item_error_tags || [],
          customisation: customisation,
          variant: variant,
          auto_flag: hit._source.auto_item_flag || false,
          manual_flag: hit._source.manual_item_flag || false,
        };
      });

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

  async getSellerIds(targetLanguage = "en") {
    const sellerCount = await client.search({
      index: "items",
      query: { bool: { must: [{ match: { language : targetLanguage }}] } },
      size: 0,
      aggs: {
        seller_count: {
          cardinality: {
            field: "context.bpp_id",
          },
        },
      },
    });

    if (sellerCount.aggregations.seller_count.value === 0){
      return [];
    }

    const allSellers = await client.search({
      size: 0,
      query:  { bool: { must: [{ match: { language : targetLanguage }}] } },
      aggs: {
        unique_sellers: {
          terms: {
            field: "bpp_details.bpp_id",
            size: sellerCount.aggregations.seller_count.value,
          },
          aggs: {
            products: {
              top_hits: {
                size: 1,
                _source: ["bpp_details.bpp_id", "bpp_details.name"],
              },
            },
          },
        },
      },
    });
    const sellers = allSellers.aggregations.unique_sellers.buckets.map(
      (seller) => {
        return {
          id: seller.key,
          label: seller.products.hits.hits[0]._source.bpp_details.name,
        };
      }
    );

    return sellers;
  }

  async getUniqueCategories(searchRequest, targetLanguage = "en") {
    let matchQuery = [];

    if (searchRequest.domain) {
      matchQuery.push({
        match: {
          "context.domain": searchRequest.domain,
        },
      });
    }

    matchQuery.push({
      match: {
        language: targetLanguage,
      },
    });

    let query_obj = {
      bool: {
        must: matchQuery,
      },
    };

    const totalCategories = await client.search({
      index: "items",
      size: 0,
      query: query_obj,
      aggs: {
        domainCategories: {
          terms: {
            field: "context.domain",
          },
          aggs: {
            uniqueCategories: {
              terms: {
                field: "item_details.category_id",
              },
            },
          },
        },
      },
    });

    console.log("CATEGORIES", totalCategories);
  
    const domainBuckets = totalCategories.aggregations.domainCategories.buckets;

    console.log("DOMAIN BUCKETS", totalCategories.aggregations.domainCategories.buckets);

    let result = {};
  
    domainBuckets.forEach(domainBucket => {
      const domainName = domainBucket.key;
      const uniqueCategories = domainBucket.uniqueCategories.buckets.map(category => {
        return { code: category.key, label: category.key };
      });
  
      result[domainName] = uniqueCategories;
    });
  
    return result;
  }

  async getProviderIds(searchRequest = {}, targetLanguage = "en") {
    try {
      let matchQuery = [];

      if (searchRequest.bpp_id) {
        matchQuery.push({
          match: {
            "context.bpp_id": searchRequest.bpp_id
          },
        });
      }

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });
      
      // Construct the base query object
      const baseQuery = {
        bool: {
          must: matchQuery,
        },
      };

      // Step 1: Count the unique providers based on bpp_id
      const providerCount = await client.search({
        index: "items",
        size: 0,
        query: baseQuery ,   
        aggs: {
          provider_count: {
            cardinality: {
              field: "provider_details.id",
            },
          },
        },
      });

      if (providerCount.aggregations.provider_count.value === 0)
        return 


      const uniqueProviders = await client.search({
        index: "items",
        query:baseQuery,
        size: 0,        
        aggs: {
          unique: {
            composite: {
              size: providerCount.aggregations.provider_count.value,
              sources: [
                { provider_id: { terms: { field: "provider_details.id" } } },
              ],
            },
            aggs: {
              top_provider_hits: {
                top_hits: {
                  _source: [
                    "provider_details.descriptor.name",
                    "provider_details.id",
                  ],
                  size: 1,
                },
              },
            },
          },
        },

      });



      
      const providers = uniqueProviders.aggregations.unique.buckets.map(
        (bucket) => {
          const topHit = bucket.top_provider_hits.hits.hits[0]._source;
          return {
            name: topHit.provider_details.descriptor.name,
            id: topHit.provider_details.id,
          };
        }
      );

      // Return the provider data wrapped in a "providers" key
      return {
        providers,
      };
    } catch (err) {
      throw err;
    }
  }

  async getLocationIds(searchRequest = {}, targetLanguage = "en") {
    try {
      let matchQuery = [];

      // Add providerId filter if it exists
      if (searchRequest.providerId) {
        matchQuery.push({
          match: {
            "provider_details.id": searchRequest.providerId,
          },
        });
      }

      matchQuery.push({
        match: {
          language: targetLanguage,
        },
      });

      // Construct the base query object
      const baseQuery = {
        bool: {
          must: matchQuery,
        },
      };

      // Step 1: Count the unique locations based on providerId
      const locationCount = await client.search({
        index: "items",
        size: 0,
        body: {
          query: baseQuery, // Only add the query if there are conditions
          aggs: {
            location_count: {
              cardinality: {
                field: "location_details.id",
              },
            },
          },
        },
      });

      // Step 2: Retrieve unique location IDs and names
      const uniqueLocations = await client.search({
        index: "items",
        size: 0,
        body: {
          query: matchQuery.length ? baseQuery : undefined, // Only add the query if there are conditions
          aggs: {
            unique: {
              composite: {
                size: locationCount.aggregations.location_count.value,
                sources: [
                  { location_id: { terms: { field: "location_details.id" } } },
                ],
              },
              aggs: {
                top_location_hits: {
                  top_hits: {
                    _source: [
                      "location_details.address.city",
                      "location_details.address.area_code",
                      "location_details.id",
                    ],
                    size: 1,
                  },
                },
              },
            },
          },
        },
      });

      // Extract the location data from aggregations
      const locations = uniqueLocations.aggregations.unique.buckets.map(
        (bucket) => {
          const topHit = bucket.top_location_hits.hits.hits[0]._source;
          const cityName = topHit.location_details.address.city || "";
          const areaCode = topHit.location_details.address.area_code || "";
          const name = `${cityName}_${areaCode}`;

          return {
            name,
            id: topHit.location_details.id,
          };
        }
      );

      // Return the location data wrapped in a "locations" key
      return {
        locations,
      };
    } catch (err) {
      throw err;
    }
  }
}

export default SearchService;
