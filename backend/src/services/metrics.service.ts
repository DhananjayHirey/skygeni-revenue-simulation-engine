import { pool } from "../config/db";

export const getBaselineMetrics = async () => {  
  const res = await pool.query(`
    SELECT * FROM deals
    WHERE created_date BETWEEN '2025-01-01' AND '2025-06-30'
  `);

  const deals = res.rows;

  let closedWon = 0;
  let closedLost = 0;
  let totalValue = 0;
  let cycleSum = 0;
  let cycleCount = 0;

  for (const d of deals) {
    if (d.stage === "Closed Won") {
      closedWon++;
      totalValue += Number(d.deal_value);

      if (d.closed_date) {
        const diff = new Date(d.closed_date).getTime() - new Date(d.created_date).getTime();
        cycleSum += diff;
        cycleCount++;
      }
    } else if (d.stage === "Closed Lost") {
      closedLost++;
    }
  }

  const conversionRate = closedWon / (closedWon + closedLost || 1);
  const avgDealSize = totalValue / (closedWon || 1);
  const avgSalesCycle = cycleSum / (cycleCount || 1);

  return {
    conversionRate,
    avgDealSize,
    avgSalesCycle,
    revenue: totalValue,
  };
};