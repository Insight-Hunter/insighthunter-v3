import React from 'react';

const WalletSync = () => {
  const connectWallet = () => {
    window.location.href = '/api/wallets/connect?walletType=paypal';
  };

  return (
    <div>
      <h2>Enable Wallet Sync</h2>
      <button onClick={connectWallet}>Connect PayPal Wallet</button>
    </div>
  );
};

export default WalletSync;
