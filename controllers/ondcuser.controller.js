// controllers/issue.controller.js
import { ondcUserService } from "../services/oms";
import fs from 'fs';
import { getDateRange } from "../utils/utilityFunctions";

class OndcUserController {

  async createOndcUser(req, res) {
    const { body, user } = req;
    try {
      const newOndcUser = await ondcUserService.createOndcUser(body);
      res.json(newOndcUser);
    } catch (err) {
      console.error('Error creating issue', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  async getAllOndcUsers(req, res) {
    try {
      let dateRangeValues
      if (req.query.dateRange) {
        dateRangeValues = await getDateRange(req.query.dateRange);
      }
      const users = await ondcUserService.getAllOndcUsers(req.query,dateRangeValues);
      res.json(users);
    } catch (err) {
      console.error('Error getting users', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


  async getAllAddress(req, res) {
    try {
      let dateRangeValues
      if (req.query.dateRange) {
        dateRangeValues = await getDateRange(req.query.dateRange);
      }
      const users = await ondcUserService.getAllAddress(req.query,dateRangeValues);
      res.json(users);
    } catch (err) {
      console.error('Error getting users', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  async getOndcUserById(req, res) {
    try {
      const { id } = req.params;
      const issue = await ondcUserService.getOndcUserById(id);
      res.json(issue);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async exportToExcel(req, res) {
    const { startTime, endTime } = req.query
    const filePath = 'users.xlsx';
    try {
      await ondcUserService.exportToExcel(filePath, startTime, endTime);
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

module.exports = new OndcUserController();