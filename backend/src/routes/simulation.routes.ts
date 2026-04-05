import express from "express";
import { simulate, getMetrics } from "../controllers/simulation.controller";

const router = express.Router();

router.post("/simulate", simulate);
router.get("/metrics", getMetrics);

export default router;