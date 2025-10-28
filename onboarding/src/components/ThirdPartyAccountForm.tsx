import React, { useEffect, useState } from "react";

export interface ThirdPartyTokens {
  stripe?: string | null;
  quickbooks?: string | null;
  xero?: string | null;
  crypto?: string | null;
}

interface ThirdPartyAccountsFormProps {
  defaultValues?: ThirdPartyTokens;
  onChange: ( ThirdPartyTokens) => void;
}

export function ThirdPartyAccountsForm({ defaultValues, onChange }: ThirdPartyAccountsFormProps) {
  const [stripeToken, setStripeToken] = useState<string | null>(defaultValues?.stripe || null);
  const [qbToken, setQbToken] = useState<string | null>(defaultValues?.quickbooks || null);
  const [xeroToken, setXeroToken] = useState<string | null>(defaultValues?.xero || null);
  const [cryptoToken, setCryptoToken] = useState<string | null>(defaultValues?.crypto || null);

  useEffect(() => {
    onChange({ stripe: stripeToken, quickbooks: qbToken, xero: xeroToken, crypto: cryptoToken });
  }, [stripeToken, qbToken, xeroToken, cryptoToken, onChange]);

  return (
    <div>
      <h2>Connect Other Accounts</h2>
      {/* Replace these buttons with actual OAuth flows */}
      <button onClick={() => alert("Implement Stripe OAuth flow")}>Connect Stripe</button>
      <button onClick={() => alert("Implement QuickBooks OAuth flow")}>Connect QuickBooks</button>
      <button onClick={() => alert("Implement Xero OAuth flow")}>Connect Xero</button>
      <button onClick={() => alert("Implement Crypto Wallet Connect")}>Connect Crypto</button>
    </div>
  );
}
