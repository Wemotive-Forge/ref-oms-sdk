// services/settlementDetailsService.js
import { SettlementDetails} from '../../models';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs'


const createSettlementDetails = async (settlementType, accountNo, bankName, branchName, orderId) => {
    try {
        const newSettlementDetails = await SettlementDetails.create({ settlementType, accountNo, bankName, branchName, orderId });
        return newSettlementDetails;
    } catch (err) {
        throw new Error(err);
    }
};

const getAllSettlementDetails = async (limit, offset, bankName, branchName, settlementType, accountNo, startTime, endTime) => {
    try {
        const whereCondition = {};
        if (bankName) {
            whereCondition.bankName = { [Op.iLike]: `%${bankName}%` };
        }
        if (branchName) {
            whereCondition.branchName = { [Op.iLike]: `%${branchName}%` };
        }
        if (settlementType) {
            whereCondition.settlementType = { [Op.iLike]: `%${settlementType}%` };
        }
        if (accountNo) {
            whereCondition.accountNo = { [Op.iLike]: `%${accountNo}%` };
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
        const settlementDetails = await SettlementDetails.findAndCountAll({
            where: whereCondition,
            offset: offset,
            limit: limit,
            order: [['createdAt', 'DESC']],
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
        }
      });
      return settlement;
    } catch (err) {
      throw new Error(err);
    }
};

const exportToExcel = async (filePath) => {
    try {
        const settlementDetails = await SettlementDetails.findAll();

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
        console.log(`Excel file saved to ${filePath}`);
    } catch (err) {
        throw new Error('Error exporting to Excel');
    }
};

export default {
    createSettlementDetails,
    getAllSettlementDetails,
    exportToExcel,
    getSettlementById
};
