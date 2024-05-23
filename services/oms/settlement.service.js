// services/settlementDetailsService.js
import { SettlementDetails,Seller, sequelize} from '../../models';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs'
import moment from 'moment';
import MESSAGES from '../../utils/messages';
import {BadRequestParameterError} from '../../lib/errors/errors';

const createSettlementDetails = async (data) => {
  let transaction;
  try {
      transaction = await sequelize.transaction();
      const newSettlementDetails = await SettlementDetails.create(data, { transaction });
      await transaction.commit();
      return newSettlementDetails;
  } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
  }
};

const getAllSettlementDetails = async (data) => {
    try {
        const whereCondition = {};
        if (data.bankName) {
            whereCondition.bankName = { [Op.iLike]: `%${data.bankName}%` };
        }
        if (data.branchName) {
            whereCondition.branchName = { [Op.iLike]: `%${data.branchName}%` };
        }
        if (data.settlementType) {
            whereCondition.settlementType = { [Op.iLike]: `%${data.settlementType}%` };
        }
        if (data.settlement_bank_account_no) {
            whereCondition.settlement_bank_account_no = { [Op.iLike]: `%${data.settlement_bank_account_no}%` };
        }
        if (data.beneficiary_name) {
            whereCondition.beneficiary_name = { [Op.iLike]: `%${data.beneficiary_name}` }
        }
        if (data.UPI) {
            whereCondition.UPI = { [Op.iLike]: `%${data.UPI}` }
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
        const settlementDetails = await SettlementDetails.findAndCountAll({
            where: whereCondition,
            offset: data.offset,
            limit: data.limit,
            order: [['createdAt', 'DESC']],
            include:[{model:Seller}]
        });
        return settlementDetails;
    } catch (err) {
        throw new Error(err);
    }
};

const getSettlementById = async (id) => {
    try {
      const settlement = await SettlementDetails.findOne({
        where: {
          id: id
        },
          include:[{model:Seller}]
      });
      return settlement;
    } catch (err) {
      throw new Error(err);
    }
};

const exportToExcel = async (filePath, startTime, endTime) => {
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
        const settlementDetails = await SettlementDetails.findAll({
            where: whereCondition,
            transaction
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('SettlementDetails');

        // Define the columns
        worksheet.columns = [
            { header: 'Settlement Type', key: 'settlementType', width: 20 },
            { header: 'Account No', key: 'accountNo', width: 20 },
            { header: 'Bank Name', key: 'bankName', width: 20 },
            { header: 'Branch Name', key: 'branchName', width: 20 }
        ];

        // Add data to the worksheet
        settlementDetails.forEach(details => {
            worksheet.addRow({
                settlementType: details.settlementType,
                accountNo: details.accountNo,
                bankName: details.bankName,
                branchName: details.branchName
            });
        });

        // Save the workbook
        await workbook.xlsx.writeFile(filePath);
        await transaction.commit();
        console.log(`Excel file saved to ${filePath}`);
    } catch (err) {
        if(transaction) await transaction.rollback();
        throw new Error('Error exporting to Excel');
    }
};

export default {
    createSettlementDetails,
    getAllSettlementDetails,
    exportToExcel,
    getSettlementById
};
