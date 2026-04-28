const db = require('../config/database');

class RebalancerService {
  
  // Get current portfolio allocation
  async getCurrentAllocation() {
    const [holdings] = await db.query(
      'SELECT asset_type, SUM(quantity * purchase_price) as total_value FROM holdings GROUP BY asset_type'
    );

    const totalValue = holdings.reduce((sum, h) => sum + parseFloat(h.total_value), 0);

    return holdings.map(h => ({
      asset_type: h.asset_type,
      current_value: parseFloat(h.total_value),
      current_percentage: (parseFloat(h.total_value) / totalValue) * 100
    }));
  }

  // Get target allocation
  async getTargetAllocation() {
    const [targets] = await db.query('SELECT * FROM target_allocation');
    return targets;
  }

  // Calculate rebalancing trades
  async calculateRebalancing() {
    const currentAllocation = await this.getCurrentAllocation();
    const targetAllocation = await this.getTargetAllocation();

    // Calculate total portfolio value
    const totalValue = currentAllocation.reduce((sum, a) => sum + a.current_value, 0);

    // Calculate what each asset type should be worth
    const rebalancingPlan = [];

    for (const target of targetAllocation) {
      const current = currentAllocation.find(c => c.asset_type === target.asset_type);
      
      const targetValue = (totalValue * parseFloat(target.target_percentage)) / 100;
      const currentValue = current ? current.current_value : 0;
      const difference = targetValue - currentValue;

      rebalancingPlan.push({
        asset_type: target.asset_type,
        target_percentage: parseFloat(target.target_percentage),
        current_percentage: current ? current.current_percentage : 0,
        target_value: targetValue,
        current_value: currentValue,
        difference: difference,
        action: difference > 0 ? 'BUY' : difference < 0 ? 'SELL' : 'HOLD',
        amount: Math.abs(difference)
      });
    }

    return {
      total_portfolio_value: totalValue,
      rebalancing_plan: rebalancingPlan
    };
  }
}

module.exports = new RebalancerService();