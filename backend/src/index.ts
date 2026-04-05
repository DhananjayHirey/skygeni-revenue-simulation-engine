import express from "express";
import helmet from "helmet";
import cors from "cors";
import simulationRoutes from "./routes/simulation.routes";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use("/api", simulationRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});