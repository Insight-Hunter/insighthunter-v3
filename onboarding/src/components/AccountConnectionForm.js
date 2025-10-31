import React, { useEffect, useState } from "react";
export function AccountConnectionForm({ defaultValues, onChange }) {
    const [method, setMethod] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.connectionMethod) || "csv");
    const [csvFile, setCsvFile] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.csvData) || null);
    const [plaidToken, setPlaidToken] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.plaidToken) || null);
    useEffect(() => {
        onChange({ connectionMethod: method, csvData: csvFile, plaidToken });
    }, [method, csvFile, plaidToken, onChange]);
    const handleCsvChange = (e) => {
        var _a;
        if ((_a = e.target.files) === null || _a === void 0 ? void 0 : _a.length) {
            setCsvFile(e.target.files[0]);
        }
        else {
            setCsvFile(null);
        }
    };
    return (<div>
      <h2>Connect Your Accounts</h2>
      <label>
        <input type="radio" value="csv" checked={method === "csv"} onChange={() => setMethod("csv")}/>
        Upload CSV
      </label>
      {method === "csv" && <input type="file" accept=".csv,text/csv" onChange={handleCsvChange}/>}

      <label>
        <input type="radio" value="plaid" checked={method === "plaid"} onChange={() => setMethod("plaid")}/>
        Connect Bank via Plaid
      </label>

      {method === "plaid" && (<div>
          <button onClick={() => alert("Implement Plaid SDK integration")}>
            Connect with Plaid
          </button>
        </div>)}
    </div>);
}
