import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  runSimulation,
  getMetrics,
  type SimulationResult,
  type BaselineMetrics,
} from "./api";
import "./App.css";

const getWeekLabel = (weekIndex: number) => {
  const start = new Date("2025-07-01");
  start.setDate(start.getDate() + weekIndex * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const format = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `W${weekIndex + 1} (${format(start)}-${format(end)})`;
};

const formatCurrency = (value: number) =>
  "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });

function App() {
  const [conversionChange, setConversionChange] = useState(0);
  const [dealSizeChange, setDealSizeChange] = useState(0);
  const [cycleChange, setCycleChange] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [baselineMetrics, setBaselineMetrics] =
    useState<BaselineMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetrics();
        setBaselineMetrics(data);
      } catch (err) {
        console.error("Failed to fetch past metrics:", err);
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchMetrics();
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await runSimulation({
        conversionChange: conversionChange / 100,
        dealSize: dealSizeChange / 100,
        cycleChange: cycleChange / 100,
      });
      setResult(data);
    } catch {
      setError("Failed to run simulation. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? result.baseline.weekly_revenue.map((base, i) => ({
        week: getWeekLabel(i),
        Baseline: Math.round(base),
        Scenario: Math.round(result.scenario.weekly_revenue[i]),
      }))
    : [];

  return (
    <div className="app">
      <header className="header">
        <h1>Revenue Simulation Engine</h1>
        <p className="subtitle">
          Adjust sales parameters below to simulate Q3 revenue outcomes based on
          Q1 &amp; Q2 performance data.
        </p>
      </header>

      {loadingMetrics ? (
        <p className="loading-text">Loading baseline metrics...</p>
      ) : baselineMetrics ? (
        <section className="historical-metrics">
          <h2>Q1 &amp; Q2 Baseline Performance</h2>
          <div className="metrics-row">
            <div className="metric-card historical">
              <span className="metric-title">Total Revenue (Q1-Q2)</span>
              <span className="metric-value">
                {formatCurrency(baselineMetrics.revenue)}
              </span>
            </div>
            <div className="metric-card historical">
              <span className="metric-title">Avg Deal Size</span>
              <span className="metric-value">
                {formatCurrency(baselineMetrics.avgDealSize)}
              </span>
            </div>
            <div className="metric-card historical">
              <span className="metric-title">Conversion Rate</span>
              <span className="metric-value">
                {(baselineMetrics.conversionRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <section className="controls">
        <h2>Simulation Controls (Q3)</h2>

        <div className="slider-group">
          <div className="slider-label">
            <span>Conversion Rate Change</span>
            <span className="slider-value">
              {conversionChange > 0 ? "+" : ""}
              {conversionChange}%
            </span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            value={conversionChange}
            onChange={(e) => setConversionChange(Number(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Avg Deal Size Change</span>
            <span className="slider-value">
              {dealSizeChange > 0 ? "+" : ""}
              {dealSizeChange}%
            </span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            value={dealSizeChange}
            onChange={(e) => setDealSizeChange(Number(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Sales Cycle Change</span>
            <span className="slider-value">
              {cycleChange > 0 ? "+" : ""}
              {cycleChange}%
            </span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            value={cycleChange}
            onChange={(e) => setCycleChange(Number(e.target.value))}
          />
        </div>

        <button onClick={handleSimulate} disabled={loading}>
          {loading ? "Running…" : "Run Simulation"}
        </button>
      </section>

      {error && <p className="error">{error}</p>}

      {result && (
        <section className="chart-section">
          <h2>Scenario Comparison</h2>
          <p className="chart-note">
            Note: W1 represents Jul 1 - Jul 7, and W12 represents Sep 16 - Sep
            22. Hover over points for exact dates.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11 }}
                tickFormatter={(val: string) => val.split(" ")[0]}
              />
              <YAxis
                tickFormatter={(v: any) => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="Baseline"
                stroke="#555"
                fill="#d9d9d9"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Scenario"
                stroke="#2563eb"
                fill="#93b8f7"
                fillOpacity={0.35}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      )}

      {result && (
        <section className="insights">
          <h2>Insights for Q3</h2>

          <div className="metrics-row">
            <div className="metric-card">
              <span className="metric-title">Baseline Projected</span>
              <span className="metric-value">
                {formatCurrency(result.baseline.total_revenue)}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-title">Simulated Projected</span>
              <span className="metric-value">
                {formatCurrency(result.scenario.total_revenue)}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-title">Impact</span>
              <span
                className={
                  "metric-value " +
                  (result.impact.absolute >= 0 ? "positive" : "negative")
                }
              >
                {result.impact.absolute >= 0 ? "+" : ""}
                {formatCurrency(result.impact.absolute)} (
                {result.impact.percentage >= 0 ? "+" : ""}
                {result.impact.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>

          {result.drivers.length > 0 && (
            <div className="drivers">
              <h3>Key Drivers</h3>
              <ul>
                {result.drivers.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
