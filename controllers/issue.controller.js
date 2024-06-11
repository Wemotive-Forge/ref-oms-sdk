// controllers/issue.controller.js
import { issueService } from "../services/oms";
import fs from 'fs';
import { getDateRange } from "../utils/utilityFunctions";

class IssueController {

  async createIssue(req, res) {
    const { body, user } = req;
    try {
      const newIssue = await issueService.createIssue(body);
      res.json(newIssue);
    } catch (err) {
      console.error('Error creating issue', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  async getAllIssues(req, res) {
    try {
      let dateRangeValues
      if (req.query.dateRange) {
        dateRangeValues = await getDateRange(req.query.dateRange);
      }
      const issues = await issueService.getAllIssues(req.query,dateRangeValues);
      res.json(issues);
    } catch (err) {
      console.error('Error getting issues', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  async getIssueById(req, res) {
    try {
      const { id } = req.params;
      const issue = await issueService.getIssueById(id);
      res.json(issue);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async exportToExcel(req, res) {
    const { startTime, endTime } = req.query
    const filePath = 'issues.xlsx';
    try {
      await issueService.exportToExcel(filePath, startTime, endTime);
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

module.exports = new IssueController();