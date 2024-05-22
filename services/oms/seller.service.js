// services/seller.service.js
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import {Seller, Order, sequelize} from '../../models';

// const { Seller, Order } = models;

const createSeller = async (gst, pan, bppId, name) => {
  try {
    const newSeller = await Seller.create({ gst, pan, bpp_id: bppId, name });
    return newSeller;
  } catch (err) {
    throw new Error(err);
  }
};

const getAllSellers = async (limit, offset, name, gst, pan, bpp_id, startTime, endTime) => {
  try {
    const whereCondition = {};
    if (name) {
      whereCondition.name = { [Op.iLike]: `%${name}%` };
    }
    if (gst) {
      whereCondition.gst = { [Op.iLike]: `%${gst}%` };
    }
    if (pan) {
      whereCondition.pan = { [Op.iLike]: `%${pan}%` };
    }
    if(bpp_id){
      whereCondition.bpp_id = {[Op.iLike]: `%${bpp_id}`}
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

    const sellers = await Seller.findAndCountAll({
      where: whereCondition,
      offset: offset,
      limit: limit,
      order: [['createdAt', 'DESC']],
    });
    return sellers;
  } catch (err) {
    throw new Error('Error getting sellers');
  }
};

const getSellerById = async (id) => {
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

const getSalesReport = async ({ limit, offset, startDate, endDate }) => {
  try {
    const sellers = await Seller.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [['createdAt', 'DESC']],
      raw:true
    });

    let salesReport = []
    for(let seller of sellers.rows){
      const stateCounts = await Order.findAll({
        attributes: [
          'state',
          [sequelize.fn('COUNT', sequelize.col('state')), 'count']
        ],
        group: ['state']
      })
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

const exportToExcel = async (filePath) => {
  try {
    const sellers = await Seller.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sellers');

    // Define the columns
    worksheet.columns = [
      { header: 'GST', key: 'gst', width: 20 },
      { header: 'PAN', key: 'pan', width: 20 },
      { header: 'BPP ID', key: 'bppId', width: 20 },
      { header: 'Name', key: 'name', width: 20 }
    ];

    // Add data to the worksheet
    sellers.forEach(seller => {
      worksheet.addRow({
        gst: seller.gst,
        pan: seller.pan,
        bppId: seller.bpp_id,
        name: seller.name
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
  createSeller,
  getAllSellers,
  exportToExcel,
  getSellerById,
  getSalesReport
};
