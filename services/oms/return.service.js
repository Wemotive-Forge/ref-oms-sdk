// services/return.service.js
import { Return} from '../../models';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import moment from 'moment';
import MESSAGES from '../../utils/messages';
import {BadRequestParameterError} from '../../lib/errors/errors';

const createReturn = async (returnId, amount, reason, OrderId) => {
  try {
    const newReturn = await Return.create({ returnId, amount, reason, OrderId });
    return newReturn;
  } catch (err) {
    throw new Error(err);
  }
};

const getAllReturns = async (data) => {
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
      whereCondition.OrderId = { [Op.iLike]: `%${data.OrderId}%` };
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
      offset: data.offset,
      limit: data.limit,
      order: [['createdAt', 'DESC']],
    });
    return returns;
  } catch (err) {
    throw new Error('Error getting returns');
  }
};

const getReturnById = async (id) => {
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

const exportToExcel = async (filePath, startTime, endTime) => {
  try {
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
    const returns = await Return.findAll({
      where: whereCondition
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Returns');

    // Define the columns
    worksheet.columns = [
      { header: 'Return ID', key: 'returnId', width: 20 },
      { header: 'Amount', key: 'amount', width: 20 },
      { header: 'Reason', key: 'reason', width: 20 },
      { header: 'Order ID', key: 'orderId', width: 20 }
    ];

    // Add data to the worksheet
    returns.forEach(returnData => {
      worksheet.addRow({
        returnId: returnData.returnId,
        amount: returnData.amount,
        reason: returnData.reason,
        orderId: returnData.orderId
      });
    });

    // Save the workbook
    await workbook.xlsx.writeFile(filePath);
    console.log(`Excel file saved to ${filePath}`);
  } catch (err) {
    throw new Error('Error exporting to Excel');
  }
};

export default {
  createReturn,
  getAllReturns,
  exportToExcel,
  getReturnById
};
