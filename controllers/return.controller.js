// controllers/return.controller.js
import {returnService} from "../services/oms";
import fs from 'fs';

const createReturn = async (req, res) => {
  const { returnId, amount, reason, orderId } = req.body;
  try {
    const newReturn = await returnService.createReturn(returnId, amount, reason, orderId);
    res.json(newReturn);
  } catch (err) {
    console.error('Error creating return', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllReturns = async (req, res) => {
  try {
    const { returnId, amount, reason, orderId,limit, offset, startTime, endTime } = req.query;
    const returns = await returnService.getAllReturns(returnId, amount, reason, orderId,limit, offset, startTime, endTime);
    res.json(returns);
  } catch (err) {
    console.error('Error getting returns', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getReturnById = async(req, res)=> {
  try {
    const { id } = req.params;
    const returns = await returnService.getReturnById(id);
    res.json(returns);
  } catch(err){
    res.status(500).json({ error: 'Internal Server Error'})
  }
}

const exportToExcel = async (req, res) => {
  const filePath = 'returns.xlsx';
  try {
    await returnService.exportToExcel(filePath);
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
  createReturn,
  getAllReturns,
  exportToExcel,
  getReturnById
};
