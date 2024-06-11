// services/issue.service.js
import { Issue, sequelize, Order } from '../../models';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import moment from 'moment';
import MESSAGES from '../../utils/messages';
import { BadRequestParameterError } from '../../lib/errors/errors';

class IssueService {

  async createIssue(data) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const newIssue = await Issue.create(data, { transaction });
      await transaction.commit();
      return newIssue;
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  };

  async getAllIssues(data,dateRangeValues) {
    try {
      // Build the where condition for category and subCategory filters
      const whereCondition = {};
      if (data.category) {
        whereCondition.category = { [Op.iLike]: `%${data.category}%` };
      }
      if (data.issueId) {
        whereCondition.issueId = { [Op.iLike]: `%${data.issueId}%` };
      }
      if (data.subCategory) {
        whereCondition.subCategory = { [Op.iLike]: `%${data.subCategory}%` };
      }
      if (data.issueStatus) {
        whereCondition.issueStatus = { [Op.iLike]: `%${data.issueStatus}%` };
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

      if(dateRangeValues){
        console.log({dateRangeValues})
        console.log(dateRangeValues.startDate)
        console.log(dateRangeValues.endDate)
        whereCondition.createdAt = {
          [Op.between]: [dateRangeValues.startDate, dateRangeValues.endDate]
        }
      }

      const issues = await Issue.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Order,
          },
        ],  
        offset: data.offset,
        limit: data.limit,
        order: [['createdAt', 'DESC']],
      });
      return issues;
    } catch (err) {
      throw new Error(err);
    }
  };

  async getIssueById(id) {
    try {
      const issue = await Issue.findOne({
        where: {
          id: id
        }
      });
      return issue;
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

      const issues = await Issue.findAll({ where: whereCondition, transaction });

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
        const issueColumns = [
          { header: 'ID', key: 'id', width: 20 },
          { header: 'Issue Id', key: 'issueId', width: 20 },
          { header: 'Category', key: 'category', width: 20 },
          { header: 'Sub Category', key: 'subCategory', width: 20 },
          { header: 'Issue Status', key: 'issueStatus', width: 20 },
        ];

      // Add Issue sheet
      const issueheet = workbook.addWorksheet('Issues');
      addSheetData(issueheet, issueColumns, issues, (issue) => ({
        id: issue.id,
        issueId: issue.issueId,
        category: issue.category,
        subCategory: issue.subCategory,
        issueStatus: issue.issueStatus,
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

module.exports = new IssueService();