import { Request, Response } from "express";
import { runSimulation } from "../services/simulation.service";
import { getBaselineMetrics } from "../services/metrics.service";

export const simulate = async (req: Request, res: Response) => {
  try {
    // console.log("Input from frontend: ",req.body);
    const result = await runSimulation(req.body);
    res.json(result);    
  } catch (err) {
    res.status(500).json({ error: "Simulation failed" });
  }
};

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = await getBaselineMetrics();
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};