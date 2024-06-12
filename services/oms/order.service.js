// services/order.service.js
import { Order, Seller, sequelize, Item, Fulfillment } from '../../models';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import moment from 'moment';
import MESSAGES from '../../utils/messages';
import { BadRequestParameterError } from '../../lib/errors/errors';

class OrderService {

  async createOrder(data) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const newOrder = await Order.create(data, { transaction });
      await transaction.commit();
      return newOrder;
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  };

  async getAllOrders(data,dateRangeValues) {
    try {
      const whereCondition = {};
      if (data.orderId) {
        whereCondition.orderId = { [Op.iLike]: `%${data.orderId}%` };
      }
      if (data.currency) {
        whereCondition.currency = { [Op.iLike]: `%${data.currency}%` };
      }
      if (data.value) {
        whereCondition.value = { [Op.iLike]: `%${data.value}%` };
      }
      if (data.bff) {
        whereCondition.bff = { [Op.iLike]: `%${data.bff}%` };
      }
      if (data.collectedBy) {
        whereCondition.collectedBy = { [Op.iLike]: `%${data.collectedBy}%` };
      }
      if (data.domain) {
        whereCondition.domain = { [Op.iLike]: `%${data.domain}%` };
      }
      if (data.city) {
        whereCondition.city = { [Op.iLike]: `%${data.city}%` };
      }
      if (data.paymentType) {
        whereCondition.paymentType = { [Op.iLike]: `%${data.paymentType}%` };
      }
      if (data.state) {
        whereCondition.state = { [Op.iLike]: `%${data.state}%` };
      }
      if (data.SellerId) {
        whereCondition.SellerId = data.SellerId;
      }
      // Adding conditions for filtering by startTime and endTime
      if (data.startTime && data.endTime) {
        const startDate = moment(data.startTime, 'YYYY-MM-DD HH:mm:ss.SSSZ');
        const endDate = moment(data.endTime, 'YYYY-MM-DD HH:mm:ss.SSSZ');

        if (startDate.isValid() && endDate.isValid()) {
          if (startDate <= endDate) {
            whereCondition.createdAt = {
              [Op.between]: [startDate.toDate(), endDate.toDate()],
            };
          } else {
            throw new BadRequestParameterError(MESSAGES.TIMEZONE_ERROR);
          }
        } else {
          throw new BadRequestParameterError(MESSAGES.INVALID_DATE);
        }
      }
      if(dateRangeValues){
        console.log({dateRangeValues})
        console.log(dateRangeValues.startDate)
        console.log(dateRangeValues.endDate)
        whereCondition.createdAt = {
            [Op.between]: [dateRangeValues.startDate, dateRangeValues.endDate]
        }
      }

      const orders = await Order.findAndCountAll({
        where: whereCondition,
        offset: data.offset,
        limit: data.limit,
        order: [['createdAt', 'DESC']],
        include: [{ model: Seller }]
      });
      return orders;
    } catch (err) {
      throw new Error(err);
    }
  };

  async getOrderById(id) {
    try {
      const order = await Order.findOne({
        where: {
          id: id
        },
        include: [{ model: Seller }]
      });
      return order;
    } catch (err) {
      throw new Error(err);
    }
  };

  async getOrderStateCounts() {
    try {
      // Count the total number of states
      const stateCounts = await Order.findAll({
        attributes: [
          'state',
          [sequelize.fn('COUNT', sequelize.col('state')), 'count']
        ],
        group: ['state']
      })

      return stateCounts;
    } catch (error) {
      console.error('Error counting order states:', error);
      throw new Error('Error counting order states');
    }
  };


  async exportToExcel(filePath, startTime, endTime) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const whereCondition = {};
      if (startTime && endTime) {
        const startDate = moment(startTime, 'YYYY-MM-DD HH:mm:ss.SSSZ');
        const endDate = moment(endTime, 'YYYY-MM-DD HH:mm:ss.SSSZ');

        if (startDate.isValid() && endDate.isValid()) {
          if (startDate <= endDate) {
            whereCondition.createdAt = {
              [Op.between]: [startDate.toDate(), endDate.toDate()],
            };
          } else {
            throw new BadRequestParameterError(MESSAGES.TIMEZONE_ERROR);
          }
        } else {
          throw new BadRequestParameterError(MESSAGES.INVALID_DATE);
        }
      }

        const orders = await Order.findAll({
            where: whereCondition,
            include: [
                { model: Seller, required: true },
                { model: Item },
                { model: Fulfillment }
            ],
            transaction
        });

      const workbook = new ExcelJS.Workbook();
      // Helper function to set columns and add rows
      function addSheetData(sheet, columns, data, rowFormatter) {
        sheet.columns = columns;
        sheet.getRow(1).font = { bold: true };

        data.forEach(item => {
          sheet.addRow(rowFormatter(item));
        });
      }
        // Define columns for each sheet
        const orderColumns = [
          { header: 'ID', key: 'id', width: 20 },
          { header: 'Order ID', key: 'orderId', width: 20 },
          { header: 'Currency', key: 'currency', width: 20 },
          { header: 'Value', key: 'value', width: 20 },
          { header: 'Final Value', key: 'finalValue', width: 20 },
          { header: 'BFF', key: 'bff', width: 20 },
          { header: 'Collected By', key: 'collectedBy', width: 20 },
          { header: 'Payment Type', key: 'paymentType', width: 20 },
          { header: 'Payment Status', key: 'paymentStatus', width: 20 },
          { header: 'State', key: 'state', width: 20 },
          { header: 'City', key: 'city', width: 20 },
          { header: 'Area Code', key: 'areaCode', width: 20 },
          { header: 'Domain', key: 'domain', width: 20 },
          { header: 'Category', key: 'category', width: 20 },
          { header: 'Cancelled By', key: 'cancelledBy', width: 20 },
          { header: 'Cancel Reason Code', key: 'cancelReasonCode', width: 20 },
          { header: 'Settlement', key: 'settlement', width: 40 },
          { header: 'Seller Id', key: 'SellerId', width: 20 },
      ];

      const sellerColumns = [
          { header: 'Seller ID', key: 'id', width: 20 },
          { header: 'GST', key: 'gst', width: 20 },
          { header: 'PAN', key: 'pan', width: 20 },
          { header: 'BPP ID', key: 'bpp_id', width: 20 },
          { header: 'Name', key: 'name', width: 20 },
      ];

      const itemColumns = [
          { header: 'ID', key: 'id', width: 20 },
          { header: 'Item ID', key: 'itemId', width: 20 },
          { header: 'Fulfillment ID', key: 'fulfillmentId', width: 20 },
          { header: 'Item Name', key: 'itemName', width: 20 },
          { header: 'Quantity', key: 'quantity', width: 20 },
          { header: 'Order Id', key: 'OrderId', width: 20 },
      ];

      const fulfillmentColumns = [
          { header: 'ID', key: 'id', width: 20 },
          { header: 'Fulfillment ID', key: 'fulfillmentId', width: 20 },
          { header: 'Fulfillment Type', key: 'fulfillmentType', width: 20 },
          { header: 'Fulfillment State', key: 'fulfillmentState', width: 20 },
          { header: 'Refund', key: 'refund', width: 20 },
          { header: 'Details', key: 'details', width: 20 },
          { header: 'Order Id', key: 'OrderId', width: 20 },
      ];

      // Add Orders sheet
      const orderSheet = workbook.addWorksheet('Orders');
      addSheetData(orderSheet, orderColumns, orders, (order) => {
          let settlementString = '';
          if (order.settlement) {
              settlementString = jsonToPlainString(order.settlement);
          }
          return {
              id: order.id,
              orderId: order.orderId,
              currency: order.currency,
              value: order.value,
              finalValue: order.finalValue,
              bff: order.bff,
              collectedBy: order.collectedBy,
              paymentType: order.paymentType,
              paymentStatus: order.paymentStatus,
              state: order.state,
              city: order.city,
              areaCode: order.areaCode,
              domain: order.domain,
              category: order.category,
              cancelledBy: order.cancelledBy,
              cancelReasonCode: order.cancelReasonCode,
              settlement: settlementString,
              SellerId: order.SellerId,
          };
      });

      // Extract unique sellers, items, and fulfillments
      const uniqueSellers = [];
      const uniqueItems = [];
      const uniqueFulfillments = [];

      orders.forEach(order => {
        if (order.Seller && !uniqueSellers.find(seller => seller.id === order.Seller.id)) {
          uniqueSellers.push(order.Seller);
        }
        order.Items.forEach(item => {
          if (!uniqueItems.find(i => i.id === item.id)) {
            uniqueItems.push(item);
          }
        });
        order.Fulfillments.forEach(fulfillment => {
          if (!uniqueFulfillments.find(f => f.id === fulfillment.id)) {
            uniqueFulfillments.push(fulfillment);
          }
        });
      });

      // console.log("SELLERS", uniqueSellers);
      // console.log("ITEMS", uniqueItems);
      // console.log("FULLFILLMENTS", uniqueFulfillments);

        // Add Sellers sheet
        const sellerSheet = workbook.addWorksheet('Sellers');
        addSheetData(sellerSheet, sellerColumns, uniqueSellers, (seller) => ({
            id: seller.id,
            gst: seller.gst,
            pan: seller.pan,
            bpp_id: seller.bpp_id,
            name: seller.name,
        }));

        // Add Items sheet
        const itemSheet = workbook.addWorksheet('Items');
        addSheetData(itemSheet, itemColumns, uniqueItems, (item) => ({
            id: item.id,
            itemId: item.itemId,
            fulfillmentId: item.fulfillmentId,
            itemName: item.itemName,
            quantity: item.quantity,
            OrderId: item.OrderId,
        }));

        // Add Fulfillments sheet
        const fulfillmentSheet = workbook.addWorksheet('Fulfillments');
        addSheetData(fulfillmentSheet, fulfillmentColumns, uniqueFulfillments, fulfillment => {
            let detailsString = '';
            if (fulfillment.details) {
                detailsString = jsonToPlainString(fulfillment.details);
            }
            return {
                id: fulfillment.id,
                fulfillmentId: fulfillment.fulfillmentId,
                fulfillmentType: fulfillment.fulfillmentType,
                fulfillmentState: fulfillment.fulfillmentState,
                refund: fulfillment.refund,
                details: detailsString,
                OrderId: fulfillment.OrderId,
            };
        });

      // Save the workbook
      await workbook.xlsx.writeFile(filePath);
      await transaction.commit();
      console.log(`Excel file saved to ${filePath}`);
    } catch (err) {
      console.log(err)
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  };

  async exportFinancialsToExcel(filePath, SellerId ) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const whereCondition = {};
      
      if (SellerId) {
        whereCondition.SellerId = SellerId;
      }

      const orders = await Order.findAll({
        where: whereCondition,
        include: [{ model: Seller, required: true }],
        transaction
      });

      const workbook = new ExcelJS.Workbook();
      // Helper function to set columns and add rows
      function addSheetData(sheet, columns, data, rowFormatter) {
        sheet.columns = columns;
        sheet.getRow(1).font = { bold: true };

        data.forEach(item => {
          sheet.addRow(rowFormatter(item));
        });
      }

      // Define columns
      const financialsColumn = [
        { header: 'ID', key: 'id', width: 20},
        { header: 'Order ID', key: 'orderId', width: 20 },
        { header: 'SNP', key: 'SellerName', width: 20 },
        { header: 'Settlement Details', key: 'settlement', width: 40 },
        { header: 'Collection', key: 'value', width: 20 },
        { header: 'Receiveables', key: 'bff', width: 20 },
        { header: 'Payables', key: 'finalValue', width: 20 },
        { header: 'Currency', key: 'currency', width: 20}
      ];

      // Add financial sheet
      const financialSheet = workbook.addWorksheet('Financials');
      addSheetData(financialSheet, financialsColumn, orders, (order)=>{
        let settlementString = '';
        if (order.settlement) {
            settlementString = jsonToPlainString(order.settlement);
        }
        return {
          id: order.id,
          orderId: order.orderId,
          SellerName: order.Seller.name,
          settlement: settlementString,
          value: order.value,
          bff: order.bff,
          finalValue: order.finalValue,
          currency: order.currency
        }
      })

      await workbook.xlsx.writeFile(filePath);
      await transaction.commit();
      console.log(`Financials Excel file saved to ${filePath}`);
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  }
}
function jsonToPlainString(jsonObj) {
  const result = [];
  const prefixesToRemove = ['@ondc/org/settlement_details_0_', '@ondc/org/buyer_app_']; // specify the prefixes to remove

  function traverse(obj, path) {
      for (let key in obj) {
          const value = obj[key];
          let newPath = path ? `${path}_${key}` : key;

          // Remove all specified prefixes from the newPath
          prefixesToRemove.forEach(prefix => {
              newPath = newPath.replace(prefix, '');
          });

          if (typeof value === 'object' && value !== null) {
              traverse(value, newPath);
          } else {
              result.push(`"${newPath}"-"${value}"`);
          }
      }
  }

  traverse(jsonObj, '');
  return result.join(', ');
}


module.exports = new OrderService();