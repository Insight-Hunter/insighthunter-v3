import React, { useEffect, useState } from "react";

export interface BusinessSetup {
  businessName: string;
  businessType?: string;
  industry?: string;
  fiscalYear?: string;
}

interface BusinessSetupFormProps {
  defaultValues?: BusinessSetup;
  onChange: ( BusinessSetup) => void;
}

export function BusinessSetupForm({ defaultValues, onChange }: BusinessSetupFormProps) {
  const [businessName, setBusinessName] = useState(defaultValues?.businessName || "");
  const [businessType, setBusinessType] = useState(defaultValues?.businessType || "");
  const [industry, setIndustry] = useState(defaultValues?.industry || "");
  const [fiscalYear, setFiscalYear] = useState(defaultValues?.fiscalYear || "");

  useEffect(() => {
    onChange({ businessName, businessType, industry, fiscalYear });
  }, [businessName, businessType, industry, fiscalYear, onChange]);

  return (
    <div>
      <h2>Business Setup</h2>
      <label>
        Business Name
        <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
      </label>
      <label>
        Business Type
        <input type="text" value={businessType} onChange={e => setBusinessType(e.target.value)} />
      </label>
      <label>
        Industry
        <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} />
      </label>
      <label>
        Fiscal Year
        <input type="text" value={fiscalYear} onChange={e => setFiscalYear(e.target.value)} placeholder="e.g., Jan-Dec" />
      </label>
    </div>
  );
}
