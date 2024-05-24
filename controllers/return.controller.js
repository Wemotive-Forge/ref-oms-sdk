// controllers/return.controller.js
import { returnService } from "../services/oms";
import fs from 'fs';

class ReturnController {

  async createReturn(req, res) {
    const { body } = req;
    try {
      const newReturn = await returnService.createReturn(body);
      res.json(newReturn);
    } catch (err) {
      console.error('Error creating return', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  async getAllReturns(req, res) {
    try {
      const returns = await returnService.getAllReturns(req.query);
      res.json(returns);
    } catch (err) {
      console.error('Error getting returns', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  async getReturnById(req, res) {
    try {
      const { id } = req.params;
      const returns = await returnService.getReturnById(id);
      res.json(returns);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async exportToExcel(req, res) {
    const { startTime, endTime } = req.query
    const filePath = 'returns.xlsx';
    try {
      await returnService.exportToExcel(filePath, startTime, endTime);
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

module.exports = new ReturnController();
