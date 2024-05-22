import {sellerService} from "../services/oms";
import fs from 'fs';

const createSeller = async (req, res) => {
  const { gst, pan, bppId, name } = req.body;
  try {
    const newSeller = await sellerService.createSeller(gst, pan, bppId, name);
    res.json(newSeller);
  } catch (err) {
    console.error('Error creating seller', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllSellers = async (req, res) => {
  try {
    const { limit, offset, name, gst, pan, bpp_id, startTime, endTime } = req.query;
    const sellers = await sellerService.getAllSellers(limit, offset, name, gst, pan, bpp_id, startTime, endTime);
    res.json(sellers);
  } catch (err) {
    console.error('Error getting sellers', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getSellerById = async(req, res)=> {
  try {
    const { id } = req.params;
    const seller = await sellerService.getSellerById(id);
    res.json(seller);
  } catch(err){
    res.status(500).json({ error: 'Internal Server Error'})
  }
}

const getSalesReport = async (req, res) => {
  try {
      const { limit, offset, startDate, endDate } = req.query;
      const salesReport = await sellerService.getSalesReport({ limit, offset, startDate, endDate });
      res.json(salesReport);
  } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

const getAccountPayableReport = async (req, res) => {
  try {
      const { limit, offset, startDate, endDate } = req.query;
      const salesReport = await sellerService.getAccountPayableReport({ limit, offset, startDate, endDate });
      res.json(salesReport);
  } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

const getAccountCollectedReport = async (req, res) => {
  try {
      const { limit, offset, startDate, endDate } = req.query;
      const salesReport = await sellerService.getAccountCollectedReport({ limit, offset, startDate, endDate });
      res.json(salesReport);
  } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

const exportToExcel = async (req, res) => {
  const filePath = 'sellers.xlsx';
  try {
    await sellerService.exportToExcel(filePath);
    res.download(filePath, (err) => {
      if (err) {
        throw new Error('Error downloading file');
      } else {
        // Delete the file after download
        fs.unlinkSync(filePath);
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
  createSeller,
  getAllSellers,
  exportToExcel,
  getSellerById,
  getSalesReport,
  getAccountPayableReport,
  getAccountCollectedReport
};
