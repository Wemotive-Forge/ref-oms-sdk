import { sellerService } from "../services/oms";
import fs from 'fs';
import { getDateRange } from "../utils/utilityFunctions";

class SellerController {

  async createSeller(req, res) {
    const { body } = req;
    try {
      const newSeller = await sellerService.createSeller(body);
      res.json(newSeller);
    } catch (err) {
      console.error('Error creating seller', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  async getAllSellers(req, res) {
    try {
      const sellers = await sellerService.getAllSellers(req.query);
      res.json(sellers);
    } catch (err) {
      console.error('Error getting sellers', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  async getSellerById(req, res) {
    try {
      const { id } = req.params;
      const seller = await sellerService.getSellerById(id);
      res.json(seller);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getSalesReport(req, res) {
    try {
      const { limit, offset, dateRange } = req.query;

      let dateRangeValues
      if (dateRange) {
        dateRangeValues = await getDateRange(dateRange);
      }
      const salesReport = await sellerService.getSalesReport({ limit, offset, dateRangeValues });
      res.json(salesReport);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  async getIssueReport(req, res) {
    try {
      const { limit, offset, dateRange } = req.query;

      let dateRangeValues
      if (dateRange) {
        dateRangeValues = await getDateRange(dateRange);
      }
      const salesReport = await sellerService.getIssueReport({ limit, offset, dateRangeValues });
      res.json(salesReport);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  async getIssueReportCount(req, res) {
    try {
      const { limit, offset, dateRange } = req.query;

      let dateRangeValues
      if (dateRange) {
        dateRangeValues = await getDateRange(dateRange);
      }
      const salesReport = await sellerService.getIssueReportCount({ limit, offset, dateRangeValues });
      res.json(salesReport);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  async getFinanceReport(req, res) {
    try {
      const { limit, offset, dateRange } = req.query;

      let dateRangeValues
      if (dateRange) {
        dateRangeValues = await getDateRange(dateRange);
      }
      const salesReport = await sellerService.getFinanceReport({ limit, offset, dateRangeValues });
      res.json(salesReport);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  async getFinanceReportCount(req, res) {
    try {
      const { limit, offset, dateRange } = req.query;

      let dateRangeValues
      if (dateRange) {
        dateRangeValues = await getDateRange(dateRange);
      }
      const salesReport = await sellerService.getFinanceReportCount({ limit, offset, dateRangeValues });
      res.json(salesReport);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  async getSalesReportTrend(req, res) {
    try {
      const { limit, offset, dateRange, interval } = req.query;

      let dateRangeValues
      if (dateRange) {
        dateRangeValues = await getDateRange(dateRange);
      }
      const salesReport = await sellerService.getSalesReportTrend({ limit, offset, dateRangeValues, interval });
      res.json(salesReport);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  async getAccountPayableReport(req, res) {
    try {
      const { limit, offset, dateRange } = req.query;

      let dateRangeValues
      if (dateRange) {
        dateRangeValues = await getDateRange(dateRange);
      }
      const salesReport = await sellerService.getAccountPayableReport({ limit, offset, dateRangeValues });
      res.json(salesReport);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  async getAccountCollectedReport(req, res) {
    try {
      const { limit, offset, dateRange } = req.query;

      let dateRangeValues
      if (dateRange) {
        dateRangeValues = await getDateRange(dateRange);
      }
      const salesReport = await sellerService.getAccountCollectedReport({ limit, offset, dateRangeValues });
      res.json(salesReport);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  async exportToExcel(req, res) {
    const { startTime, endTime } = req.query
    const filePath = 'sellers.xlsx';
    try {
      await sellerService.exportToExcel(filePath, startTime, endTime);
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

module.exports = new SellerController();
