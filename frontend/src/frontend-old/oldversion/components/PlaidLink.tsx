import React, { useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidLinkProps {
  linkToken: string;
  onSuccess: (publicToken: string) => void;
  onExit?: () => void;
}

const PlaidLink: React.FC<PlaidLinkProps> = ({ linkToken, onSuccess, onExit }) => {
  const onSuccessCallback = useCallback(
    (public_token: string) => {
      onSuccess(public_token);
    },
    [onSuccess]
  );

  const onExitCallback = useCallback(() => {
    if (onExit) onExit();
  }, [onExit]);

  const config = {
    token: linkToken,
    onSuccess: onSuccessCallback,
    onExit: onExitCallback,
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <button onClick={() => open()} disabled={!ready} style={{ padding: '1rem', fontSize: '1rem' }}>
      Connect with Plaid
    </button>
  );
};

export default PlaidLink;
