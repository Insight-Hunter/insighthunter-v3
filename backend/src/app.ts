import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


import onboardingRoutes from "./routes/onboarding";
import ForecastRoutes from './routes/forecast';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import forecastRoutes from './routes/forecast';
import reportsRoutes from './routes/reports';
import analyticsRoutes from './routes/analytics';
import transactionsRoutes from './routes/transactions';

const app = express();

// Security middlewares
app.use(helmet());

app.use('/api/forecast', forecastRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/auth', authRoutes);

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
