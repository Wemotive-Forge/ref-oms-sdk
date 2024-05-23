import { settlementService } from "../services/oms";
import fs from 'fs';

class SettlementDetailsController {

    async createSettlementDetails(req, res) {
        const { body } = req;
        try {
            const newSettlementDetails = await settlementService.createSettlementDetails(body);
            res.json(newSettlementDetails);
        } catch (err) {
            console.error('Error creating settlement details', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    async getAllSettlementDetails(req, res) {
        try {
            const settlementDetails = await settlementService.getAllSettlementDetails(req.query);
            res.json(settlementDetails);
        } catch (err) {
            console.error('Error getting settlement details', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    async getSettlementById(req, res) {
        try {
            const { id } = req.params;
            const settlement = await settlementService.getSettlementById(id);
            res.json(settlement);
        } catch (err) {
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    async exportToExcel(req, res) {
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
}

module.exports = new SettlementDetailsController();
