import express from "express";
import cors from "cors";
import onboardingRoutes from "./routes/onboarding";

const app = express();

app.use(cors({
  origin: "http://localhost:3000", // Replace with your frontend origin
  credentials: true,
}));

app.use(express.json());

app.use("/api/onboarding", onboardingRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
