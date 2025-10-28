function ThirdPartyOAuthButtons({ onConnect }) {
  return (
    <div>
      <button onClick={() => alert("Implement Stripe OAuth flow")}>Connect Stripe</button>
      <button onClick={() => alert("Implement QuickBooks OAuth flow")}>Connect QuickBooks</button>
      <button onClick={() => alert("Implement Xero OAuth flow")}>Connect Xero</button>
      <button onClick={() => alert("Implement Crypto Wallet Connect")}>Connect Crypto</button>
    </div>
  );
}
