// services/return.service.js
import { Return} from '../../models';
import ExcelJS from 'exceljs';

const createReturn = async (returnId, amount, reason, orderId) => {
  try {
    const newReturn = await Return.create({ returnId, amount, reason, orderId });
    return newReturn;
  } catch (err) {
    throw new Error(err);
  }
};

const getAllReturns = async (returnId, amount, reason, orderId ,limit, offset, startTime, endTime) => {
  try {
    const whereCondition = {};
    if (returnId) {
      whereCondition.returnId = { [Op.iLike]: `%${returnId}%` };
    }
    if (amount) {
      whereCondition.amount = { [Op.iLike]: `%${amount}%` };
    }
    if (reason) {
      whereCondition.reason = { [Op.iLike]: `%${reason}%` };
    }
    if (orderId) {
      whereCondition.orderId = { [Op.iLike]: `%${orderId}%` };
    }
    // Adding conditions for filtering by startTime and endTime
    if (startTime && endTime) {
      // Convert epoch timestamps to JavaScript Date objects in milliseconds
      const startDate = parseInt(startTime);
      const endDate = parseInt(endTime);

      if (startDate <= endDate) {
        whereCondition.createdAt = {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        };
      } else {
        throw new Error('startTime must be less than or equal to endTime');
      }
    }
    const returns = await Return.findAndCountAll({
      where: whereCondition,
      offset: offset,
      limit: limit,
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

const exportToExcel = async (filePath) => {
  try {
    const returns = await Return.findAll();

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
