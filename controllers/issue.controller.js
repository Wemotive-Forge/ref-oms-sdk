// controllers/issue.controller.js
import {issueService} from "../services/oms";
import fs from 'fs';

const createIssue = async (req, res) => {
  const { category, issueId, subCategory, issueStatus, orderId } = req.body;
  try {
    const newIssue = await issueService.createIssue(category, issueId, subCategory, issueStatus, orderId);
    res.json(newIssue);
  } catch (err) {
    console.error('Error creating issue', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const { limit, offset, category, issueId, subCategory, issueStatus, orderId, startTime, endTime } = req.query;
    const issues = await issueService.getAllIssues(limit, offset, category, issueId, subCategory, issueStatus, orderId, startTime, endTime);
    res.json(issues);
  } catch (err) {
    console.error('Error getting issues', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getIssueById = async(req, res)=> {
  try {
    const { id } = req.params;
    const issue = await issueService.getIssueById(id);
    res.json(issue);
  } catch(err){
    res.status(500).json({ error: 'Internal Server Error'})
  }
}

const exportToExcel = async (req, res) => {
  const filePath = 'issues.xlsx';
  try {
    await issueService.exportToExcel(filePath);
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
  createIssue,
  getAllIssues,
  exportToExcel,
  getIssueById
};
