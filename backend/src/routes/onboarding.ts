import express from "express";
import { validateSchema } from "../middlewares/validation";
import * as schemas from "../schemas/onboarding";
import * as services from "../services/onboardingServices";

const router = express.Router();

router.post("/personal-info", validateSchema(schemas.personalInfoSchema), async (req, res) => {
  try {
    await services.savePersonalInfo(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/business-setup", validateSchema(schemas.businessSetupSchema), async (req, res) => {
  try {
    await services.saveBusinessSetup(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/csv-upload", validateSchema(schemas.csvUploadSchema), async (req, res) => {
  try {
    await services.processCsvData(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "CSV processing failed" });
  }
});

router.post("/plaid-connect", validateSchema(schemas.plaidConnectSchema), async (req, res) => {
  try {
    const { userId, token } = req.body;
    await services.linkPlaidAccount(userId, token);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Plaid connection failed" });
  }
});

router.post("/third-party-connect", validateSchema(schemas.thirdPartyTokensSchema), async (req, res) => {
  try {
    const { userId, tokens } = req.body;
    await services.saveThirdPartyTokens(userId, tokens);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Third-party token saving failed" });
  }
});

router.post("/invoice-setup", validateSchema(schemas.invoiceSettingsSchema), async (req, res) => {
  try {
    const { userId, invoiceSettings } = req.body;
    await services.saveInvoiceSettings(userId, invoiceSettings);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Invoice setup failed" });
  }
});

router.post("/finalize", validateSchema(schemas.finalizeSchema), async (req, res) => {
  try {
    const { userId } = req.body;
    await services.markOnboardingComplete(userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Finalization failed" });
  }
});

export default router;
