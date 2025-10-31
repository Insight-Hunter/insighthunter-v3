import React, { useEffect, useState } from "react";
export function BusinessSetupForm({ defaultValues, onChange }) {
    const [businessName, setBusinessName] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.businessName) || "");
    const [businessType, setBusinessType] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.businessType) || "");
    const [industry, setIndustry] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.industry) || "");
    const [fiscalYear, setFiscalYear] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.fiscalYear) || "");
    useEffect(() => {
        onChange({ businessName, businessType, industry, fiscalYear });
    }, [businessName, businessType, industry, fiscalYear, onChange]);
    return (<div>
      <h2>Business Setup</h2>
      <label>
        Business Name
        <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required/>
      </label>
      <label>
        Business Type
        <input type="text" value={businessType} onChange={e => setBusinessType(e.target.value)}/>
      </label>
      <label>
        Industry
        <input type="text" value={industry} onChange={e => setIndustry(e.target.value)}/>
      </label>
      <label>
        Fiscal Year
        <input type="text" value={fiscalYear} onChange={e => setFiscalYear(e.target.value)} placeholder="e.g., Jan-Dec"/>
      </label>
    </div>);
}
