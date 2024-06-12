// controllers/order.controller.js
import { orderService } from "../services/oms";
import { getDateRange } from "../utils/utilityFunctions";
import fs from 'fs';

class OrderController {

  async createOrder(req, res) {
    const { body } = req;
    try {
      const newOrder = await orderService.createOrder(body);
      res.json(newOrder);
    } catch (err) {
      console.error('Error creating order', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  async getAllOrders(req, res) {
    try {
      let dateRangeValues
      if (req.query.dateRange) {
        dateRangeValues = await getDateRange(req.query.dateRange);
      }
      const orders = await orderService.getAllOrders(req.query,dateRangeValues);
      res.json(orders);
    } catch (err) {
      console.error('Error getting orders', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  };

  async getOrderStateCounts(req, res) {
    try {
      const totalCount = await orderService.getOrderStateCounts();
      res.json(totalCount);
    } catch (error) {
      console.error('Error in getOrderStateCountsController:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  async exportToExcel(req, res) {
    const { startTime, endTime } = req.query
    const filePath = 'orders.xlsx';
    try {
      await orderService.exportToExcel(filePath, startTime, endTime);
      res.download(filePath, (err) => {
        if (err) {
          throw new Error('Error downloading file');
        } else {
          // Delete the file after download
          fs.unlinkSync(filePath);
        }
      });
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: err.message });
    }
  };

  async exportFinancialsToExcel(req, res){
    const { SellerId } = req.query
    const filePath = 'financials.xlsx';
    try {
      await orderService.exportFinancialsToExcel(filePath, SellerId);
      res.download(filePath, (err) => {
        if(err) {
          throw new Error('Error downloading file');
        } else {
          //Delete the file after downlaod
          fs.unlinkSync(filePath);
        }
      });
    } catch(err) {
      console.log(err);
      res.status(500).json({ message: err.message })
    }
  }
}

module.exports = new OrderController();
