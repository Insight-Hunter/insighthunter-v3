import Joi from "joi";
export const personalInfoSchema = Joi.object({
    name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
});
export const businessSetupSchema = Joi.object({
    userId: Joi.string().required(),
    businessName: Joi.string().min(1).required(),
    businessType: Joi.string().optional(),
    industry: Joi.string().optional(),
});
export const csvUploadSchema = Joi.object({
    userId: Joi.string().required(),
    csvData: Joi.string().required(),
});
export const plaidConnectSchema = Joi.object({
    userId: Joi.string().required(),
    token: Joi.string().required(),
});
export const thirdPartyTokensSchema = Joi.object({
    userId: Joi.string().required(),
    tokens: Joi.object({
        stripe: Joi.string().optional().allow(null),
        quickbooks: Joi.string().optional().allow(null),
        xero: Joi.string().optional().allow(null),
        crypto: Joi.string().optional().allow(null),
    }).required(),
});
export const invoiceSettingsSchema = Joi.object({
    userId: Joi.string().required(),
    invoiceSettings: Joi.object({
        alertThreshold: Joi.number().required(),
    }).required(),
});
export const finalizeSchema = Joi.object({
    userId: Joi.string().required(),
});
