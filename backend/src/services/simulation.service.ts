import { pool } from "../config/db";
import { getBaselineMetrics } from "./metrics.service";

export const runSimulation = async (input: {
  conversionChange: number;
  dealSize: number;
  cycleChange: number;
}) => {
  const metrics = await getBaselineMetrics();

  const q3Res = await pool.query(`
    SELECT * FROM deals
    WHERE created_date BETWEEN '2025-07-01' AND '2025-09-30'
      AND closed_date IS NULL
  `);

  const q3Deals = q3Res.rows;
  const conversionChange = Number(input.conversionChange ?? 0);
  const dealSizeChange = Number(input.dealSize ?? 0);
  const cycleChange = Number(input.cycleChange ?? 0);

  const baseRevenue = q3Deals.length * metrics.conversionRate * metrics.avgDealSize;
  const newConversion = metrics.conversionRate * (1 + conversionChange);

  const newDealSize = metrics.avgDealSize * (1 + dealSizeChange);

  const newRevenue = q3Deals.length * newConversion * newDealSize;

  // console.log("Q3 Deals:", q3Deals.length);
  // console.log("Base Conversion:", metrics.conversionRate);
  // console.log("Base Deal Size:", metrics.avgDealSize);
  // console.log("Input:", input);
  // console.log("New Conversion:", newConversion);
  // console.log("New Deal Size:", newDealSize);
  // console.log("New Revenue:", newRevenue);


  const weeks = 12; 
  const baselineWeekly = Array(weeks).fill(0);
  const scenarioWeekly = Array(weeks).fill(0);

  for (const deal of q3Deals) {
    const created = new Date(deal.created_date);

    
    const expectedClose = new Date(created.getTime() + metrics.avgSalesCycle);

    
    const weekIndex = Math.floor((expectedClose.getTime() - new Date("2025-07-01").getTime()) /
          (7 * 24 * 60 * 60 * 1000))
    // Logic for calculation of weekIndex:
    // exp close time - 1/7/2025 --> total time duration from starting Q3
    // divide by 7 --> eg. 12days after 1/7/2025 will be 12/7 which is 1.7 ~ 1 i.e. week2

    if (weekIndex < 0) continue;

    
    const baseValue = Number(deal.deal_value) * metrics.conversionRate;

    baselineWeekly[weekIndex] += baseValue;

    
    const scenarioValue = Number(deal.deal_value) * newConversion * (1 + dealSizeChange);

    scenarioWeekly[weekIndex] += scenarioValue;
  }


  const percentage = ((newRevenue - baseRevenue) / baseRevenue) * 100;

  const drivers = [];

  if (conversionChange > 0) {
    drivers.push("Increase in conversion rate");
  } else if (conversionChange < 0) {
    drivers.push("Decrease in conversion rate");
  }

  if (dealSizeChange > 0) {
    drivers.push("Increase in average deal size");
  } else if (dealSizeChange < 0) {
    drivers.push("Decrease in average deal size");
  }

  if (cycleChange < 0) {
    drivers.push("Reduction in sales cycle duration");
  } else if (cycleChange > 0) {
    drivers.push("Increase in sales cycle duration");
  }

  return {
    baseline: {
      weekly_revenue: baselineWeekly,
      total_revenue: baseRevenue,
    },
    scenario: {
      weekly_revenue: scenarioWeekly,
      total_revenue: newRevenue,
    },
    impact: {
      absolute: newRevenue - baseRevenue,
      percentage,
    },
    drivers: drivers,
  };
};