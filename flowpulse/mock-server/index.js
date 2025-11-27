import express from "express";
import cors from "cors";
import { dataset } from "./data.js";

const app = express();
app.use(cors());

app.get("/overview", (_req, res) => res.json(dataset.overview));
app.get("/timeline", (_req, res) => res.json(dataset.timeline));
app.get("/heatmap", (_req, res) => res.json(dataset.heatmap));
app.get("/sessions", (_req, res) => res.json(dataset.sessions));
app.get("/top-apps", (_req, res) => res.json(dataset.topApps));

const port = process.env.PORT ?? 5055;
app.listen(port, () => {
  console.log(`Mock API ready on http://localhost:${port}`);
});
