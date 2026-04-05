const API_URL = "http://localhost:5000/api";

export interface SimulationInput {
  conversionChange: number;
  dealSize: number;
  cycleChange: number;
}

export interface SimulationResult {
  baseline: {
    weekly_revenue: number[];
    total_revenue: number;
  };
  scenario: {
    weekly_revenue: number[];
    total_revenue: number;
  };
  impact: {
    absolute: number;
    percentage: number;
  };
  drivers: string[];
}

export async function runSimulation(
  input: SimulationInput
): Promise<SimulationResult> {
  const res = await fetch(`${API_URL}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error("Simulation request failed");
  }
  return res.json();
}

export interface BaselineMetrics {
  conversionRate: number;
  avgDealSize: number;
  avgSalesCycle: number;
  revenue: number;
}

export async function getMetrics(): Promise<BaselineMetrics> {
  const res = await fetch(`${API_URL}/metrics`);
  if (!res.ok) {
    throw new Error("Metrics request failed");
  }
  return res.json();
}
