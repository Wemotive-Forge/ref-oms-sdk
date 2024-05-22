// services/seller.service.js
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import { Seller, Order } from '../../models';

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
    const sellers = await Seller.findAll({
      include: [{
        model: Order,
        attributes: ['value', 'state'],
        as: 'orders',
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      }],
      attributes: ['id', 'name'],
      limit,
      offset
    });

    // Mapping between order states from the API and expected states in the function
    const stateMapping = {
      "In-progress": "inprogress",
      "Cancelled": "cancelled",
      "Completed": "confirmed",
      "Accepted": "created"
    };

    const salesReport = sellers.map(seller => {
      // Initialize order counts
      const orderCounts = {
        confirmed: 0,
        cancelled: 0,
        created: 0,
        inprogress: 0
      };

      // Count orders based on their statuses
      seller.orders.forEach(order => {
        // Map the order state to the expected state name
        const mappedState = stateMapping[order.state];
        if (mappedState in orderCounts) {
          orderCounts[mappedState]++;
        }
      });

      return {
        sellerId: seller.id,
        sellerName: seller.name,
        totalSales: seller.orders.reduce((total, order) => total + order.value, 0),
        orderCounts: orderCounts
      };
    });

    return salesReport;
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
