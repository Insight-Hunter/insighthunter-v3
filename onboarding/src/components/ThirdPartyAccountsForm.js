import React, { useEffect, useState } from "react";
export function ThirdPartyAccountsForm({ defaultValues, onChange }) {
    const [stripeToken, setStripeToken] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.stripe) || null);
    const [qbToken, setQbToken] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.quickbooks) || null);
    const [xeroToken, setXeroToken] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.xero) || null);
    const [cryptoToken, setCryptoToken] = useState((defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.crypto) || null);
    useEffect(() => {
        onChange({ stripe: stripeToken, quickbooks: qbToken, xero: xeroToken, crypto: cryptoToken });
    }, [stripeToken, qbToken, xeroToken, cryptoToken, onChange]);
    return (<div>
      <h2>Connect Other Accounts</h2>
      <button onClick={() => alert("Implement Stripe OAuth flow")}>Connect Stripe</button>
      <button onClick={() => alert("Implement QuickBooks OAuth flow")}>Connect QuickBooks</button>
      <button onClick={() => alert("Implement Xero OAuth flow")}>Connect Xero</button>
      <button onClick={() => alert("Implement Crypto Wallet Connect")}>Connect Crypto</button>
    </div>);
}
