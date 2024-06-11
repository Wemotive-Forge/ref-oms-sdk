// services/return.service.js
import { Return, Order , sequelize} from '../../models';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import moment from 'moment';
import MESSAGES from '../../utils/messages';
import { BadRequestParameterError } from '../../lib/errors/errors';

class ReturnService {

  async createReturn(data) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const newReturn = await Return.create(data, { transaction });
      await transaction.commit();
      return newReturn;
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  };

  async getAllReturns(data) {
    try {
      const whereCondition = {};
      if (data.returnId) {
        whereCondition.returnId = { [Op.iLike]: `%${data.returnId}%` };
      }
      if (data.amount) {
        whereCondition.amount = { [Op.iLike]: `%${data.amount}%` };
      }
      if (data.reason) {
        whereCondition.reason = { [Op.iLike]: `%${data.reason}%` };
      }
      if (data.OrderId) {
        whereCondition.OrderId = data.OrderId;
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
      const returns = await Return.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Order,
            where: { SellerId: data.SellerId },
          },
        ], 
        offset: data.offset,
        limit: data.limit,
        order: [['createdAt', 'DESC']],
      });
      return returns;
    } catch (err) {
      throw new Error('Error getting returns');
    }
  };

  async getReturnById(id) {
    try {
      const returns = await Return.findOne({
        where: {
          id: id
        }
      });
      return returns;
    } catch (err) {
      throw new Error(err);
    }
  };

  async exportToExcel(filePath, startTime, endTime) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const whereCondition = {};
      if (startTime && endTime) {
        // Parse and format dates using moment-timezone
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
      const returns = await Return.findAll({ where: whereCondition, transaction });

      const workbook = new ExcelJS.Workbook();
      // Helper function to set columns and add rows
      function addSheetData(sheet, columns, data, rowFormatter) {
        sheet.columns = columns;
        sheet.getRow(1).font = { bold: true };

        data.forEach(item => {
          sheet.addRow(rowFormatter(item));
        });
      }

      const returnColumn = [
        { header: 'ID', key: 'id', width:20 },
        { header: 'Return ID', key: 'returnId', width: 20 },
        { header: 'Amount', key: 'amount', width: 20 },
        { header: 'Reason', key: 'reason', width: 20 },
        { header: 'Order ID', key: 'OrderId', width: 20 }
      ]

      // Add Return sheet
      const returnSheet = workbook.addWorksheet('Returns');
      addSheetData(returnSheet, returnColumn, returns, (ret) => ({
        id: ret.id,
        returnId:ret.returnId,
        amount:ret.amount,
        reason:ret.reason,
        OrderId:ret.OrderId
      }));

      // Save the workbook
      await workbook.xlsx.writeFile(filePath);
      await transaction.commit();
      console.log(`Excel file saved to ${filePath}`);
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error('Error exporting to Excel');
    }
  };
}

module.exports = new ReturnService();
