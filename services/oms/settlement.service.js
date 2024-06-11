// services/settlementDetailsService.js
import { SettlementDetails, Seller, sequelize } from '../../models';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs'
import moment from 'moment';
import MESSAGES from '../../utils/messages';
import { BadRequestParameterError } from '../../lib/errors/errors';

class SettlementDetailsService {

  async createSettlementDetails(data) {
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

  async getAllSettlementDetails(data) {
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
      if(data.SellerId) {
        whereCondition.SellerId = data.SellerId
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
        include: [{ model: Seller }]
      });
      return settlementDetails;
    } catch (err) {
      throw new Error(err);
    }
  };

  async getSettlementById(id) {
    try {
      const settlement = await SettlementDetails.findOne({
        where: {
          id: id
        },
        include: [{ model: Seller }]
      });
      return settlement;
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
      const settlementDetails = await SettlementDetails.findAll({ where: whereCondition, transaction });

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
      const settlementColumns = [
        { header: 'ID', key: 'id', width: 20 },
        { header: 'Settlement Type', key: 'settlementType', width: 20 },
        { header: 'Bank Name', key: 'bankName', width: 20 },
        { header: 'Branch Name', key: 'branchName', width: 20 },
        { header: 'UPI', key: 'UPI', width: 20 },
        { header: 'Settlement Bank Ac Number', key: 'settlement_bank_account_no', width: 20 },
        { header: 'Beneficiary Name', key: 'beneficiary_name', width: 20 },
      ];

      //Add Settlement Sheet
      const settlementSheet = workbook.addWorksheet('SettlementDetails')
      addSheetData(settlementSheet, settlementColumns, settlementDetails, (settlement) => ({
        id: settlement.id,
        settlementType: settlement.settlementType,
        bankName: settlement.bankName,
        branchName: settlement.branchName,
        UPI: settlement.UPI,
        settlement_bank_account_no: settlement.settlement_bank_account_no,
        beneficiary_name: settlement.beneficiary_name,
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

module.exports = new SettlementDetailsService();
