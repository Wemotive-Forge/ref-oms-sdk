import {settlementService} from "../services/oms";

import fs from 'fs';

const createSettlementDetails = async (req, res) => {
    const { body } = req;
    try {
        const newSettlementDetails = await settlementService.createSettlementDetails(body);
        res.json(newSettlementDetails);
    } catch (err) {
        console.error('Error creating settlement details', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllSettlementDetails = async (req, res) => {
    try {
        const settlementDetails = await settlementService.getAllSettlementDetails(req.query);
        res.json(settlementDetails);
    } catch (err) {
        console.error('Error getting settlement details', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getSettlementById = async(req, res)=> {
    try {
      const { id } = req.params;
      const settlement = await settlementService.getSettlementById(id);
      res.json(settlement);
    } catch(err){
      res.status(500).json({ error: 'Internal Server Error'})
    }
  }

const exportToExcel = async (req, res) => {
    const { startTime, endTime } = req.query
    const filePath = 'settlementDetails.xlsx';
    try {
        await settlementService.exportToExcel(filePath, startTime, endTime);
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
    createSettlementDetails,
    getAllSettlementDetails,
    exportToExcel,
    getSettlementById
};
