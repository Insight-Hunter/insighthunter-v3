import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import onboardingRoutes from "./routes/onboarding";

const app = express();

// Security middlewares
app.use(helmet());

// Basic rate limiting - Prevent abuse
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Enable CORS for your frontend domain(s)
app.use(cors({
  origin: ["http://localhost:3000", "https://app.insighthunter.app"],
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Onboarding API routes
app.use("/api/onboarding", onboardingRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Insight Hunter API running on port ${PORT}`);
});
