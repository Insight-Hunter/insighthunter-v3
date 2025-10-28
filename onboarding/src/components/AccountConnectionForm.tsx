import React, { useEffect, useState } from "react";

export type ConnectionMethod = "csv" | "plaid";

export interface AccountConnectionData {
  connectionMethod: ConnectionMethod;
  csvData: File | null;
  plaidToken: string | null;
}

interface AccountConnectionFormProps {
  defaultValues?: AccountConnectionData;
  onChange: ( AccountConnectionData) => void;
}

export function AccountConnectionForm({ defaultValues, onChange }: AccountConnectionFormProps) {
  const [method, setMethod] = useState<ConnectionMethod>(defaultValues?.connectionMethod || "csv");
  const [csvFile, setCsvFile] = useState<File | null>(defaultValues?.csvData || null);
  const [plaidToken, setPlaidToken] = useState<string | null>(defaultValues?.plaidToken || null);

  useEffect(() => {
    onChange({ connectionMethod: method, csvData: csvFile, plaidToken });
  }, [method, csvFile, plaidToken, onChange]);

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setCsvFile(e.target.files[0]);
    } else {
      setCsvFile(null);
    }
  };

  return (
    <div>
      <h2>Connect Your Accounts</h2>
      <label>
        <input
          type="radio"
          value="csv"
          checked={method === "csv"}
          onChange={() => setMethod("csv")}
        />
        Upload CSV
      </label>
      {method === "csv" && <input type="file" accept=".csv,text/csv" onChange={handleCsvChange} />}

      <label>
        <input
          type="radio"
          value="plaid"
          checked={method === "plaid"}
          onChange={() => setMethod("plaid")}
        />
        Connect Bank via Plaid
      </label>

      {method === "plaid" && (
        <div>
          <button onClick={() => alert("Implement Plaid SDK integration")}>
            Connect with Plaid
          </button>
        </div>
      )}
    </div>
  );
}
