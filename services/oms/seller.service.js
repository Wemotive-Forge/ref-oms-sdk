// services/seller.service.js
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import { Seller, Order, Issue,sequelize } from '../../models';
import moment from 'moment';
import MESSAGES from '../../utils/messages';
import { BadRequestParameterError } from '../../lib/errors/errors';

class SellerService {

  async createSeller(data) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const newSeller = await Seller.create(data, { transaction });
      await transaction.commit();
      return newSeller;
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  };

  async getAllSellers(data) {
    try {
      const whereCondition = {};
      if (data.name) {
        whereCondition.name = { [Op.iLike]: `%${data.name}%` };
      }
      if (data.gst) {
        whereCondition.gst = { [Op.iLike]: `%${data.gst}%` };
      }
      if (data.pan) {
        whereCondition.pan = { [Op.iLike]: `%${data.pan}%` };
      }
      if (data.bpp_id) {
        whereCondition.bpp_id = { [Op.iLike]: `%${data.bpp_id}` }
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

      const sellers = await Seller.findAndCountAll({
        where: whereCondition,
        offset: data.offset,
        limit: data.limit,
        order: [['createdAt', 'DESC']],
      });
      return sellers;
    } catch (err) {
      throw new Error('Error getting sellers');
    }
  };

  async getSellerById(id) {
    try {
      const seller = await Seller.findOne({
        where: {
          id: id
        }
      });
      return seller;
    } catch (err) {
      throw new Error(err);
    }
  };

  async getSalesReport({ limit, offset, dateRangeValues }) {
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

        const stateCounts = await Order.findAll({
          where: query,
          attributes: [
            'state',
            [sequelize.fn('COUNT', sequelize.col('state')), 'count'],
          ],
          group: ['state']
        })

        const totalCounts = await Order.findAll({
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
            },
//            ,SellerId:seller.id

          }
        }else{
                  query = {
//                    SellerId:seller.id

                  }
        }

        const stateCounts = await Issue.findAll({
          where: query,
          attributes: [
            'issueStatus',
            [sequelize.fn('COUNT', sequelize.col('issueStatus')), 'count'],
          ],
          include: [
            {
              model: Order,
              where: { SellerId: seller.id },
              attributes: [] // Exclude Order attributes from the final result
            }
          ],
          group: ['issueStatus']
        });
        seller.stats = stateCounts
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

  async getFinanceReport({ limit, offset, dateRangeValues }) {
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
               },
               SellerId:seller.id

             }
           }else{
                     query = {
                       SellerId:seller.id

                     }
           }

           const stateCounts = await Order.findAll({
             where: query,
             attributes: [
               [sequelize.fn('SUM', sequelize.col('value')), 'value'],
               [sequelize.fn('SUM', sequelize.col('bff')), 'bff'],
               [sequelize.fn('SUM', sequelize.col('finalValue')), 'finalValue'],
             ]

           });
           seller.stats = stateCounts
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

  async getIssueReportCount({ limit, offset, dateRangeValues }) {
    try {

        const stateCounts = await Issue.findAll({
          attributes: [
            'issueStatus',
            [sequelize.fn('COUNT', sequelize.col('issueStatus')), 'count'],
          ],
          group: ['issueStatus']
        });
      return stateCounts;
    } catch (err) {
      console.error('Error fetching sales report:', err);
      throw new Error('Error fetching sales report');
    }
  };

  async getFinanceReportCount({ limit, offset, dateRangeValues }) {
       try {

           const stateCounts = await Order.findAll({
             attributes: [
               [sequelize.fn('SUM', sequelize.col('value')), 'collection'],
               [sequelize.fn('SUM', sequelize.col('bff')), 'receivable'],
               [sequelize.fn('SUM', sequelize.col('finalValue')), 'payable'],
             ]

           });
         return stateCounts;
       } catch (err) {
         console.error('Error fetching sales report:', err);
         throw new Error('Error fetching sales report');
       }
  };

  async getSalesReportTrend({ limit, offset, dateRangeValues, interval }) {
    try {

      let query = {}
      if (dateRangeValues) {
        query = {
          createdAt: {
            [Op.between]: [dateRangeValues.startDate, dateRangeValues.endDate]
          }
        }
      }

      let dateFormat;

      console.log("interbal------>", interval)
      switch (interval) {
        case 'daily':
          dateFormat = 'D';
          break;
        case 'weekly':
          dateFormat = 'W'; // %W gives the week number
          break;
        case 'monthly':
          dateFormat = 'Month';
          break;
        default:
          dateFormat = 'Month';
          break;
      }

      const ordersObject = await Order.findAll({
        attributes: [
          'state',
          // [sequelize.fn('MONTH', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('to_char', sequelize.col('createdAt'), dateFormat), 'date'],
          [sequelize.fn('COUNT', sequelize.col('state')), 'count']
        ],
        where: {
          createdAt: {
            [Op.between]: [dateRangeValues.startDate, dateRangeValues.endDate]
          }
        },
        group: [sequelize.literal(`to_char("createdAt", '${dateFormat}')`), 'state'],
        // order: [[sequelize.literal('date'), 'ASC']]//
      });

      const orders = ordersObject.map(order => order.get({ plain: true }));

      const dates = Array.from(new Set(orders.map(item => item.date))).sort();

      const states = Array.from(new Set(orders.map(item => item.state)));

      // Map data for each state and date
      const seriesData = states.map(state => {
        return {
          name: state,
          type: 'line',
          stack: 'total',
          data: dates.map(date => {
            const item = orders.find(d => d.state === state && d.date === date);
            return item ? parseInt(item.count, 10) : 0;
          })
        };
      });
      return { yAxis: seriesData, xAxis: dates };
    } catch (err) {
      console.error('Error fetching sales report:', err);
      throw new Error('Error fetching sales report');
    }
  };

  async getAccountPayableReport({ limit, offset, dateRangeValues }) {
    try {

      const sellers = await Seller.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [['createdAt', 'DESC']],
        raw: true
      });

      let salesReport = []
      for (let seller of sellers.rows) {
        let query = {
          SellerId: seller.id,
          state: { [Op.in]: ['Created', 'Accepted', 'In-progress', 'Completed'] },
        }
        if (dateRangeValues) {
          query = {
            createdAt: {
              [Op.between]: [dateRangeValues.startDate, dateRangeValues.endDate]
            },
            SellerId: seller.id,
            state: { [Op.in]: ['Created', 'Accepted', 'In-progress', 'Completed'] },
          }
        }
        const stateCounts = await Order.findAll({
          where: query,
          attributes: [
            [sequelize.fn('SUM', sequelize.col('value')), 'sum'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
        })
        seller.stats = stateCounts
        salesReport.push(seller)
      }
      sellers.rows = salesReport;

      return sellers;
    } catch (err) {
      console.error('Error fetching sales report:', err);
      throw new Error('Error fetching sales report');
    }
  };

  async getAccountCollectedReport({ limit, offset, dateRangeValues }) {
    try {

      const sellers = await Seller.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [['createdAt', 'DESC']],
        raw: true
      });

      let salesReport = []
      for (let seller of sellers.rows) {
        let query = {
          SellerId: seller.id,
          state: { [Op.in]: ['Created', 'Accepted', 'In-progress', 'Completed'] },
        }
        if (dateRangeValues) {
          query = {
            createdAt: {
              [Op.between]: [dateRangeValues.startDate, dateRangeValues.endDate]
            },
            SellerId: seller.id,
            state: { [Op.in]: ['Created', 'Accepted', 'In-progress', 'Completed'] },
          }
        }
        const stateCounts = await Order.findAll({
          where: query,
          attributes: [
            [sequelize.fn('SUM', sequelize.col('value')), 'sum'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
        })
        seller.stats = stateCounts
        salesReport.push(seller)
      }
      sellers.rows = salesReport;

      return sellers;
    } catch (err) {
      console.error('Error fetching sales report:', err);
      throw new Error('Error fetching sales report');
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
      const sellers = await Seller.findAll({ where: whereCondition, transaction });

      const workbook = new ExcelJS.Workbook();

      // Helper function to set columns and add rows
      function addSheetData(sheet, columns, data, rowFormatter) {
        sheet.columns = columns;
        sheet.getRow(1).font = { bold: true };

        data.forEach(item => {
          sheet.addRow(rowFormatter(item));
        });
      }

      const sellerColumns = [
        { header: 'Seller ID', key: 'id', width: 20 },
        { header: 'GST', key: 'gst', width: 20 },
        { header: 'PAN', key: 'pan', width: 20 },
        { header: 'BPP ID', key: 'bpp_id', width: 20 },
        { header: 'Name', key: 'name', width: 20 },
    ];
    
      // Add Sellers sheet
      const sellerSheet = workbook.addWorksheet('Sellers');
      addSheetData(sellerSheet, sellerColumns, sellers, (seller) => ({
        id: seller.id,
        gst: seller.gst,
        pan: seller.pan,
        bpp_id: seller.bpp_id,
        name: seller.name,
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

module.exports = new SellerService();