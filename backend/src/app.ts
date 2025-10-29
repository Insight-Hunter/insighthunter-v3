import express from "express";
import onboardingRoutes from "./routes/onboarding";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/onboarding", onboardingRoutes);

app.listen(4000, () => {
  console.log("API running on port 4000");
});

