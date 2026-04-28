-- Holdings table
CREATE TABLE IF NOT EXISTS holdings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  asset_type ENUM('stock', 'bond', 'etf') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Target allocation table
CREATE TABLE IF NOT EXISTS target_allocation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_type VARCHAR(20) NOT NULL,
  target_percentage DECIMAL(5, 2) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default target allocation
INSERT INTO target_allocation (asset_type, target_percentage) VALUES
('stock', 60.00),
('bond', 40.00);