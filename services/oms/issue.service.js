// services/issue.service.js
import { Issue} from '../../models';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import moment from 'moment';
import MESSAGES from '../../utils/messages';
import {BadRequestParameterError} from '../../lib/errors/errors';

const createIssue = async (category, issueId, subCategory, issueStatus, OrderId) => {
  try {
    const newIssue = await Issue.create({ category, issueId, subCategory, issueStatus, OrderId });
    return newIssue;
  } catch (err) {
    throw new Error(err);
  }
};

const getAllIssues = async (data) => {
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

    const issues = await Issue.findAndCountAll({
      where: whereCondition,
      offset: data.offset,
      limit: data.limit,
      order: [['createdAt', 'DESC']],
    });
    return issues;
  } catch (err) {
    throw new Error(err);
  }
};

const getIssueById = async (id) => {
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

const exportToExcel = async (filePath, startTime, endTime) => {
  try {
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

    const issues = await Issue.findAll({
      where: whereCondition
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Issues');

    // Define the columns
    worksheet.columns = [
      { header: 'Category', key: 'category', width: 20 },
      { header: 'IssueId', key: 'issueId', width: 20},
      { header: 'Subcategory', key: 'subCategory', width: 20 },
      { header: 'Issue Status', key: 'issueStatus', width: 20 },
      { header: 'Order ID', key: 'orderId', width: 20 }
    ];

    // Add data to the worksheet
    issues.forEach(issue => {
      worksheet.addRow({
        category: issue.category,
        issueId: issue.issueId,
        subCategory: issue.subCategory,
        issueStatus: issue.issueStatus,
        orderId: issue.orderId
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
  createIssue,
  getAllIssues,
  exportToExcel,
  getIssueById
};
