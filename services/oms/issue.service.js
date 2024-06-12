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
          { header: 'Complaint', key: 'compalinant', width: 20 },
          { header: 'Respondent', key: 'respondent', width: 20},
          { header: 'Order Id', key: 'OrderId', width: 20},
        ];

      // Add Issue sheet
      const issueheet = workbook.addWorksheet('Issues');
      addSheetData(issueheet, issueColumns, issues, (issue) => ({
        id: issue.id,
        issueId: issue.issueId,
        category: issue.category,
        subCategory: issue.subCategory,
        issueStatus: issue.issueStatus,
        OrderId: issue.OrderId,
        complainant: issue.complainant,
        respondent: issue.respondent
      }));

      // Save the workbook
      await workbook.xlsx.writeFile(filePath);
      await transaction.commit();
      console.log(`Excel file saved to ${filePath}`);
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  };


  async getIssueReport({ limit, offset, dateRangeValues }) {
    try {
      const sellers = await Seller.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [['createdAt', 'DESC']],
        raw: true
      });

      let salesReport = []
      for (let seller of sellers.rows) {
        let query = {}
        if (dateRangeValues) {
          query = {
            createdAt: {
              [Op.between]: [dateRangeValues.startDate, dateRangeValues.endDate]
            }
            ,SellerId:seller.id
          }
        }else{
                  query = {
                    SellerId:seller.id
                  }
        }

        const stateCounts = await Issue.findAll({
          where: query,
          attributes: [
            'state',
            [sequelize.fn('COUNT', sequelize.col('state')), 'count'],
          ],
          group: ['state']
        })

        const totalCounts = await Issue.findAll({
          where: query,
          attributes: [
            [sequelize.fn('SUM', sequelize.col('value')), 'value']
          ],
        })

        seller.stats = stateCounts
        seller.total = totalCounts[0].value
        salesReport.push(seller)
      }
      sellers.rows = salesReport;
      console.log(sellers)
      return sellers;
    } catch (err) {
      console.error('Error fetching sales report:', err);
      throw new Error('Error fetching sales report');
    }
  };

}

module.exports = new IssueService();