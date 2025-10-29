import React, { useEffect, useState } from "react";

export interface InvoiceSettings {
  alertThreshold: number;
}

interface InvoiceInsightsFormProps {
  defaultValues?: InvoiceSettings;
  onChange: ( InvoiceSettings) => void;
}

export function InvoiceInsightsForm({ defaultValues, onChange }: InvoiceInsightsFormProps) {
  const [alertThreshold, setAlertThreshold] = useState<number>(defaultValues?.alertThreshold ?? 1000);

  useEffect(() => {
    onChange({ alertThreshold });
  }, [alertThreshold, onChange]);

  return (
    <div>
      <h2>Invoice Insights</h2>
      <label>
        Alert Threshold ($)
        <input
          type="number"
          value={alertThreshold}
          min={0}
          onChange={(e) => setAlertThreshold(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
