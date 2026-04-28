const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- IN-MEMORY DATA FOR SERVERLESS DEMO ---
let holdings = [
  { id: 1, ticker: 'AAPL', quantity: 10, purchase_price: 150.00, asset_type: 'stock' },
  { id: 2, ticker: 'MSFT', quantity: 15, purchase_price: 300.00, asset_type: 'stock' },
  { id: 3, ticker: 'BND', quantity: 50, purchase_price: 80.00, asset_type: 'bond' }
];
let nextId = 4;

// --- ROUTES ---
// 1. Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API running on AWS Lambda (Serverless)' });
});

// 2. Get Holdings
app.get('/api/portfolio/holdings', (req, res) => {
  res.json({ success: true, data: holdings });
});

// 3. Add Holding
app.post('/api/portfolio/holdings', (req, res) => {
  const { ticker, quantity, purchase_price, asset_type } = req.body;
  if (!ticker || !quantity || !purchase_price || !asset_type) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  
  const newHolding = { id: nextId++, ticker: ticker.toUpperCase(), quantity, purchase_price, asset_type };
  holdings.push(newHolding);
  res.json({ success: true, message: 'Holding added', data: newHolding });
});

// 4. Get Allocation
app.get('/api/portfolio/allocation', (req, res) => {
  const grouped = holdings.reduce((acc, h) => {
    acc[h.asset_type] = (acc[h.asset_type] || 0) + (h.quantity * h.purchase_price);
    return acc;
  }, {});
  
  const totalValue = Object.values(grouped).reduce((sum, val) => sum + val, 0);
  const allocation = Object.entries(grouped).map(([asset_type, value]) => ({
    asset_type,
    value,
    percentage: ((value / totalValue) * 100).toFixed(2)
  }));
  
  res.json({ success: true, total_value: totalValue, allocation });
});

// 5. Rebalance Portfolio
app.get('/api/portfolio/rebalance', (req, res) => {
  const targets = { stock: 60, bond: 40 }; // Target allocation %
  
  const grouped = holdings.reduce((acc, h) => {
    acc[h.asset_type] = (acc[h.asset_type] || 0) + (h.quantity * h.purchase_price);
    return acc;
  }, {});
  
  const totalValue = Object.values(grouped).reduce((sum, val) => sum + val, 0);
  
  const plan = Object.entries(targets).map(([asset_type, target_pct]) => {
    const currentValue = grouped[asset_type] || 0;
    const currentPct = (currentValue / totalValue) * 100;
    const targetValue = (totalValue * target_pct) / 100;
    const difference = targetValue - currentValue;
    
    return {
      asset_type,
      target_percentage: target_pct,
      current_percentage: currentPct.toFixed(2),
      target_value: targetValue,
      current_value: currentValue,
      action: difference > 0 ? 'BUY' : difference < 0 ? 'SELL' : 'HOLD',
      amount: Math.abs(difference)
    };
  });
  
  res.json({ success: true, data: { total_portfolio_value: totalValue, rebalancing_plan: plan } });
});

// Export for Serverless
module.exports.handler = serverless(app);