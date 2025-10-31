var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { validateSchema } from "../middlewares/validation";
import * as schemas from "../schemas/onboarding";
import * as services from "../services/onboardingServices";
const router = express.Router();
router.post("/personal-info", validateSchema(schemas.personalInfoSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield services.savePersonalInfo(req.body);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}));
router.post("/business-setup", validateSchema(schemas.businessSetupSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield services.saveBusinessSetup(req.body);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}));
router.post("/csv-upload", validateSchema(schemas.csvUploadSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield services.processCsvData(req.body);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "CSV processing failed" });
    }
}));
router.post("/plaid-connect", validateSchema(schemas.plaidConnectSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, token } = req.body;
        yield services.linkPlaidAccount(userId, token);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Plaid connection failed" });
    }
}));
router.post("/third-party-connect", validateSchema(schemas.thirdPartyTokensSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, tokens } = req.body;
        yield services.saveThirdPartyTokens(userId, tokens);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Third-party token saving failed" });
    }
}));
router.post("/invoice-setup", validateSchema(schemas.invoiceSettingsSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, invoiceSettings } = req.body;
        yield services.saveInvoiceSettings(userId, invoiceSettings);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Invoice setup failed" });
    }
}));
router.post("/finalize", validateSchema(schemas.finalizeSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        yield services.markOnboardingComplete(userId);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Finalization failed" });
    }
}));
export default router;
