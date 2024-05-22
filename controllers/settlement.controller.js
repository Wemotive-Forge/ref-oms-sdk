import {settlementService} from "../services/oms";

import fs from 'fs';

const createSettlementDetails = async (req, res) => {
    const { settlementType, accountNo, bankName, branchName, orderId } = req.body;
    try {
        const newSettlementDetails = await settlementDetailsService.createSettlementDetails(settlementType, accountNo, bankName, branchName, orderId);
        res.json(newSettlementDetails);
    } catch (err) {
        console.error('Error creating settlement details', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllSettlementDetails = async (req, res) => {
    try {
        const { limit, offset, settlementType, accountNo, bankName, branchName, startTime, endTime } = req.query;
        const settlementDetails = await settlementDetailsService.getAllSettlementDetails(limit, offset,settlementType, accountNo, bankName, branchName, startTime, endTime);
        res.json(settlementDetails);
    } catch (err) {
        console.error('Error getting settlement details', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getSettlementById = async(req, res)=> {
    try {
      const { id } = req.params;
      const settlement = await settlementDetailsService.getSettlementById(id);
      res.json(settlement);
    } catch(err){
      res.status(500).json({ error: 'Internal Server Error'})
    }
  }

const exportToExcel = async (req, res) => {
    const filePath = 'settlementDetails.xlsx';
    try {
        await settlementDetailsService.exportToExcel(filePath);
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
