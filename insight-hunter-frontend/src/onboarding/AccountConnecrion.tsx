import React from 'react';

const AccountConnection = () => {
  const connectQuickBooks = () => {
    window.location.href = '/api/accounts/connect?accountType=quickbooks';
  };

  const connectXero = () => {
    window.location.href = '/api/accounts/connect?accountType=xero';
  };

  return (
    <div>
      <h2>Connect Your Financial Accounts</h2>
      <button onClick={connectPlaid}>Connect Your Bank</button>
      <button onClick={connectQuickBooks}>Connect QuickBooks</button>
      <button onClick={connectXero}>Connect Xero</button>
      <button onClick={() => alert('Skipping account connection may limit features.')}>Skip for Now</button>
    </div>
  );
};

export default
