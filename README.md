# Portfolio Rebalancer API

> Automated portfolio rebalancing system demonstrating robo-advisor concepts for FinTech applications.

Built in 48 hours to understand Ginmon's technical stack and business model.

## 🎯 What It Does

Helps investors maintain target asset allocation by calculating rebalancing trades.

**Example:**
- **Target:** 60% stocks, 40% bonds
- **Current:** 70% stocks, 30% bonds  
- **API suggests:** Sell $500 stocks, buy $500 bonds

## 🏗️ Architecture

```
Client Request
     ↓
Express API (Node.js)
     ↓
Rebalancing Algorithm
     ↓
MySQL Database
     ↓
Trade Recommendations
```

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Database:** MySQL (Ginmon's database)
- **Deployment:** Docker + AWS Lambda (Ginmon's serverless platform)
- **Cloud:** AWS (eu-central-1)

## 📡 API Endpoints

### 1. Health Check
```bash
GET /health
Response: {"status": "OK", "message": "API is running"}
```

### 2. Add Holding
```bash
POST /api/portfolio/holdings
Content-Type: application/json

{
  "ticker": "AAPL",
  "quantity": 10,
  "purchase_price": 150,
  "asset_type": "stock"
}
```

### 3. Get All Holdings
```bash
GET /api/portfolio/holdings
```

### 4. Get Current Allocation
```bash
GET /api/portfolio/allocation

Response:
{
  "success": true,
  "total_value": 5500,
  "allocation": [
    {"asset_type": "stock", "value": 4500, "percentage": "81.82"},
    {"asset_type": "bond", "value": 1000, "percentage": "18.18"}
  ]
}
```

### 5. Calculate Rebalancing (THE CORE FEATURE)
```bash
GET /api/portfolio/rebalance

Response:
{
  "success": true,
  "data": {
    "total_portfolio_value": 5500,
    "rebalancing_plan": [
      {
        "asset_type": "stock",
        "target_percentage": 60,
        "current_percentage": 81.82,
        "target_value": 3300,
        "current_value": 4500,
        "difference": -1200,
        "action": "SELL",
        "amount": 1200
      },
      {
        "asset_type": "bond",
        "target_percentage": 40,
        "current_percentage": 18.18,
        "target_value": 2200,
        "current_value": 1000,
        "difference": 1200,
        "action": "BUY",
        "amount": 1200
      }
    ]
  }
}
```

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Docker Desktop (optional)

### Option 1: Standard Setup
```bash
# 1. Clone
git clone https://github.com/abdul-haq/portfolio-rebalancer-api.git
cd portfolio-rebalancer-api

# 2. Install dependencies
npm install

# 3. Setup MySQL
mysql -u root -p
CREATE DATABASE portfolio_rebalancer;
exit;

# Run schema
mysql -u root -p portfolio_rebalancer < src/config/schema.sql

# 4. Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# 5. Start server
npm run dev
```

Server runs at `http://localhost:3000`

### Option 2: Docker (Recommended)
```bash
# Start everything (API + MySQL)
docker-compose up --build

# API available at http://localhost:3000
# MySQL available at localhost:3306
```

## ☁️ Cloud Deployment (AWS Lambda)

Deployed on AWS Lambda for serverless scaling.

**Live URL:** https://5w32ghppi9.execute-api.eu-central-1.amazonaws.com/dev/

```bash
# Deploy to AWS
serverless deploy
```

**Why Serverless?**
- Zero server management
- Automatic scaling (0 to millions)
- Pay per request
- 99.99% uptime

## 🧠 The Rebalancing Algorithm

### How It Works:

1. **Calculate Current Allocation**
```
   Total Portfolio = Sum of all holdings
   Stock % = (Stock Value / Total) × 100
   Bond % = (Bond Value / Total) × 100
```

2. **Compare to Target (60/40)**
```
   Target Stock Value = Total × 0.60
   Target Bond Value = Total × 0.40
```

3. **Calculate Difference**
```
   Stock Difference = Target - Current
   If negative → SELL
   If positive → BUY
```

4. **Generate Trade Plan**
```
   Sell overweight assets
   Buy underweight assets
   Amounts balance out (sell $X = buy $X)
```

### Production Considerations

Real robo-advisors like Ginmon also handle:
- **Tax-loss harvesting** (sell losers to offset gains)
- **Transaction costs** (minimize trades)
- **Minimum trade amounts** ($50+ typically)
- **Drift thresholds** (only rebalance if >5% off target)
- **Market timing** (avoid rebalancing during volatility)

This is a simplified version focusing on core logic.

## 📊 Database Schema

```sql
-- Holdings table
CREATE TABLE holdings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  asset_type ENUM('stock','bond','etf') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Target allocation
CREATE TABLE target_allocation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_type VARCHAR(20) NOT NULL,
  target_percentage DECIMAL(5,2) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎓 What I Learned

Built this project to understand:
- How robo-advisors work technically
- Portfolio rebalancing algorithms  
- MySQL database design for financial data
- Serverless architecture (AWS Lambda)
- Docker containerization
- RESTful API best practices

## 🔮 Future Improvements

If I continue this project:
- [ ] Real-time stock prices (Yahoo Finance API)
- [ ] Tax-loss harvesting logic
- [ ] Transaction cost optimization
- [ ] User authentication (JWT)
- [ ] Historical rebalancing tracking
- [ ] Port to Java + Quarkus (Ginmon's stack)
- [ ] Comprehensive testing (Jest)
- [ ] CI/CD pipeline (GitHub Actions)

**What I bring:**
- 3 years Full-Stack development experience
- M.Sc. in High Integrity Systems (formal methods)
- Strong backend fundamentals (APIs, databases, cloud)
- Fast learner (built this while learning your stack)
- Passion for FinTech and automated investing

## 👤 Author

**Abdul Haq**
- GitHub: [@abdul-haq](https://github.com/abdul-haq)
- LinkedIn: [linkedin.com/in/abdul-haq1](https://linkedin.com/in/abdul-haq1)
- Email: abdulhaq.dev@gmail.com

## 📝 License

MIT License - Feel free to use this for learning purposes.

---

**Note:** This is a learning project. For production use, add proper authentication, error handling, rate limiting, monitoring, and compliance with financial regulations.