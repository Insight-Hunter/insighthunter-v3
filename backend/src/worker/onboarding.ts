import { Router } from 'itty-router';
import type { Env } from '../types/env';

// Import all onboarding API handlers
import { onRequestPost as businessSetupAPI } from './onboarding/businessSetupAPI';
import { onRequestPost as accountConnectionAPI } from './onboarding/accountConnectionAPI';
import { onRequestPost as invoiceSetupAPI } from './onboarding/invoiceSetupAPI';
import { onRequestPost as preferencesAPI } from './onboarding/preferencesAPI';
import { onRequestGet as summaryAPI } from './onboarding/summaryAPI';
import { onRequestPost as walletSyncAPI } from './onboarding/walletSyncAPI';
import { onRequestGet as createPlaidLinkTokenAPI } from './onboarding/createPlaidLinkTokenAPI';
import { onRequestPost as plaidExchangeAPI } from './onboarding/plaidExchangeAPI';

const router = Router();

router.post('/api/onboarding/business-setup', businessSetupAPI);
router.post('/api/onboarding/connect-account', accountConnectionAPI);
router.post('/api/onboarding/invoice-setup', invoiceSetupAPI);
router.post('/api/onboarding/preferences', preferencesAPI);
router.post('/api/onboarding/wallet-sync', walletSyncAPI);
router.get('/api/onboarding/summary', summaryAPI);

router.get('/api/plaid/create-link-token', createPlaidLinkTokenAPI);
router.post('/api/onboarding/plaid-connection', plaidExchangeAPI);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Basic auth verification (optional — improve for production)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${env.USER_API_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    return router.handle(request, env, ctx);
  },
};
