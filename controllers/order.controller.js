// controllers/order.controller.js
import {orderService} from "../services/oms";
import fs from 'fs';

const createOrder = async (req, res) => {
  const { orderId, currency, value, bff, collectedBy, paymentType, state, sellerId } = req.body;
  try {
    const newOrder = await orderService.createOrder(orderId, currency, value, bff, collectedBy, paymentType, state, sellerId);
    res.json(newOrder);
  } catch (err) {
    console.error('Error creating order', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders(req.query);
    res.json(orders);
  } catch (err) {
    console.error('Error getting orders', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getOrderById = async(req, res)=> {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    res.json(order);
  } catch(err){
    res.status(500).json({ error: 'Internal Server Error'})
  }
}

const getOrderStateCountsController = async (req, res) => {
  try {
      const totalCount = await orderService.getOrderStateCounts();
      res.json(totalCount);
  } catch (error) {
      console.error('Error in getOrderStateCountsController:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

const exportToExcel = async (req, res) => {
  const filePath = 'orders.xlsx';
  try {
    await orderService.exportToExcel(filePath);
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

export default {
  createOrder,
  getAllOrders,
  exportToExcel,
  getOrderById,
  getOrderStateCountsController
};
