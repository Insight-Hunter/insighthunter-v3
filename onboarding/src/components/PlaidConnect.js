import React from "react";
import { usePlaidLink } from "react-plaid-link";
function PlaidConnect({ onConnect }) {
    const onSuccess = React.useCallback((public_token) => {
        // pass token to parent component or backend
        onConnect(public_token);
    }, [onConnect]);
    const config = {
        clientName: "Insight Hunter",
        env: "sandbox", // swap with production env as needed
        key: "PLAID_PUBLIC_KEY", // Replace with your Plaid public key
        product: ["auth", "transactions"],
        onSuccess,
    };
    const { open, ready, error } = usePlaidLink(config);
    return (<>
      <button onClick={() => open()} disabled={!ready}>
        Connect Bank via Plaid
      </button>
      {error && <div className="plaid-error">Error: {error.display_message}</div>}
    </>);
}
