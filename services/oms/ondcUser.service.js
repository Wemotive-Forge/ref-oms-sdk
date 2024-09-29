// services/ondcUser.service.js
import { OndcUser,Address, sequelize, Order } from '../../models';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import moment from 'moment';
import MESSAGES from '../../utils/messages';
import { BadRequestParameterError } from '../../lib/errors/errors';

class OndcUserService {

  async createOndcUser(userData) {
    let transaction;
    try {

      console.log(userData)

      const { uid, email, displayName, phoneNumber } = userData.user;
      const { refId } = userData.address;
    
      // Find or create the user by UID
      let user = await OndcUser.findOne({ where: { uid } });
    
      if (!user) {
        user = await OndcUser.create({ uid, email, displayName, phoneNumber });
      }
    
      // Check if the address already exists by refId
      let address = null;
      if (refId) {
        address = await Address.findOne({ where: { refId, userId: uid } });
      }
    
      if (address) {
        // Update the existing address
        await address.update(userData.address);
      } else {
        // Create a new address
        userData.address.userId = uid; // Set the userId to match the user UID
        await Address.create(userData.address);
      }
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  };

  async getAllOndcUsers(data,dateRangeValues) {
    try {
      // Build the where condition for category and subCategory filters
      const whereCondition = {};
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

      const ondcUsers = await OndcUser.findAndCountAll({
        where: whereCondition,
        offset: data.offset,
        limit: data.limit,
        order: [['createdAt', 'DESC']],
      });
      return ondcUsers;
    } catch (err) {
      throw new Error(err);
    }
  };

  async getAllAddress(data,dateRangeValues) {
    try {
      // Build the where condition for category and subCategory filters
      const whereCondition = {};
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

      const ondcUsers = await Address.findAndCountAll({
        where: whereCondition,
        offset: data.offset,
        limit: data.limit,
        order: [['createdAt', 'DESC']],
      });
      return ondcUsers;
    } catch (err) {
      throw new Error(err);
    }
  };

  async getOndcUserById(id) {
    try {
      const ondcUser = await OndcUser.findOne({
        where: {
          id: id
        }
      });
      return ondcUser;
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

      const ondcUsers = await OndcUser.findAll({ where: whereCondition, transaction });

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
        const ondcUserColumns = [
          { header: 'ID', key: 'id', width: 20 },
          { header: 'OndcUser Id', key: 'ondcUserId', width: 20 },
          { header: 'Category', key: 'category', width: 20 },
          { header: 'Sub Category', key: 'subCategory', width: 20 },
          { header: 'OndcUser Status', key: 'ondcUserStatus', width: 20 },
          { header: 'Complaint', key: 'compalinant', width: 20 },
          { header: 'Respondent', key: 'respondent', width: 20},
          { header: 'Order Id', key: 'OrderId', width: 20},
        ];

      // Add OndcUser sheet
      const ondcUserheet = workbook.addWorksheet('OndcUsers');
      addSheetData(ondcUserheet, ondcUserColumns, ondcUsers, (ondcUser) => ({
        id: ondcUser.id,
        ondcUserId: ondcUser.ondcUserId,
        category: ondcUser.category,
        subCategory: ondcUser.subCategory,
        ondcUserStatus: ondcUser.ondcUserStatus,
        OrderId: ondcUser.OrderId,
        complainant: ondcUser.complainant,
        respondent: ondcUser.respondent
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


  async getOndcUserReport({ limit, offset, dateRangeValues }) {
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

        const stateCounts = await OndcUser.findAll({
          where: query,
          attributes: [
            'state',
            [sequelize.fn('COUNT', sequelize.col('state')), 'count'],
          ],
          group: ['state']
        })

        const totalCounts = await OndcUser.findAll({
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

module.exports = new OndcUserService();