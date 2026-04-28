const express = require('express');
const router = express.Router();
const db = require('../config/database');
const rebalancerService = require('../services/rebalancer');


router.get('/rebalance', async (req, res) => {
  try {
    const plan = await rebalancerService.calculateRebalancing();
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// GET all holdings
router.get('/holdings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM holdings ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST add new holding
router.post('/holdings', async (req, res) => {
  try {
    const { ticker, quantity, purchase_price, asset_type } = req.body;
    
    // Validation
    if (!ticker || !quantity || !purchase_price || !asset_type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO holdings (ticker, quantity, purchase_price, asset_type) VALUES (?, ?, ?, ?)',
      [ticker.toUpperCase(), quantity, purchase_price, asset_type]
    );

    res.json({ 
      success: true, 
      message: 'Holding added successfully',
      id: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET current allocation
router.get('/allocation', async (req, res) => {
  try {
    const [holdings] = await db.query(
      'SELECT asset_type, SUM(quantity * purchase_price) as total_value FROM holdings GROUP BY asset_type'
    );

    // Calculate total portfolio value
    const totalValue = holdings.reduce((sum, h) => sum + parseFloat(h.total_value), 0);

    // Calculate percentages
    const allocation = holdings.map(h => ({
      asset_type: h.asset_type,
      value: parseFloat(h.total_value),
      percentage: ((parseFloat(h.total_value) / totalValue) * 100).toFixed(2)
    }));

    res.json({ 
      success: true, 
      total_value: totalValue,
      allocation: allocation 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE holding
router.delete('/holdings/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM holdings WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }

    res.json({ success: true, message: 'Holding deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;