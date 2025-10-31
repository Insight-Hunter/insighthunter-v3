import React, { useEffect, useState } from "react";
export function InvoiceInsightsForm({ defaultValues, onChange }) {
    var _a;
    const [alertThreshold, setAlertThreshold] = useState((_a = defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.alertThreshold) !== null && _a !== void 0 ? _a : 1000);
    useEffect(() => {
        onChange({ alertThreshold });
    }, [alertThreshold, onChange]);
    return (<div>
      <h2>Invoice Insights</h2>
      <label>
        Alert Threshold ($)
        <input type="number" value={alertThreshold} min={0} onChange={(e) => setAlertThreshold(Number(e.target.value))}/>
      </label>
    </div>);
}
