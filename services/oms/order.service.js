// services/order.service.js
import { Order, Seller, sequelize } from '../../models';
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

  async getAllOrders(data) {
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
      if (data.paymentType) {
        whereCondition.paymentType = { [Op.iLike]: `%${data.paymentType}%` };
      }
      if (data.state) {
        whereCondition.state = { [Op.iLike]: `%${data.state}%` };
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
        transaction
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');

      // Define the columns
      worksheet.columns = [
        { header: 'Order ID', key: 'orderId', width: 20 },
        { header: 'Currency', key: 'currency', width: 20 },
        { header: 'Value', key: 'value', width: 20 },
        { header: 'BFF', key: 'bff', width: 20 },
        { header: 'Collected By', key: 'collectedBy', width: 20 },
        { header: 'Payment Type', key: 'paymentType', width: 20 }
      ];

      // Add data to the worksheet
      orders.forEach(order => {
        worksheet.addRow({
          orderId: order.orderId,
          currency: order.currency,
          value: order.value,
          bff: order.bff,
          collectedBy: order.collectedBy,
          paymentType: order.paymentType
        });
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
}

module.exports = new OrderService();