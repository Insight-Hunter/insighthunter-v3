import express from "express";
const router = express.Router();

router.post("/personal-info", (req, res) => {
  // Save req.body to database
  res.json({ success: true });
});

router.post("/business-setup", (req, res) => {
  // Save req.body to database
  res.json({ success: true });
});

router.post("/csv-upload", (req, res) => {
  // Parse/process CSV from req.body or req.file
  res.json({ success: true });
});

router.post("/plaid-connect", (req, res) => {
  // Save Plaid token from req.body
  res.json({ success: true });
});

router.post("/third-party-connect", (req, res) => {
  // Save 3rd party tokens from req.body
  res.json({ success: true });
});

router.post("/invoice-setup", (req, res) => {
  // Save invoice settings from req.body
  res.json({ success: true });
});

router.post("/finalize", (req, res) => {
  // Final onboarding logic
  res.json({ success: true });
});

export default router;
