import { Router } from 'itty-router';
import { onRequestPost as businessSetupAPI } from './businessSetupAPI';
import { onRequestPost as accountConnectionAPI } from './accountConnectionAPI';
import { onRequestPost as invoiceSetupAPI } from './invoiceSetupAPI';
import { onRequestPost as walletSyncAPI } from './walletSyncAPI';
import { onRequestPost as preferencesAPI } from './preferencesAPI';
import { onRequestGet as summaryAPI } from './summaryAPI';

const router = Router();

router.post('/api/onboarding/business-setup', businessSetupAPI);
router.post('/api/onboarding/connect-account', accountConnectionAPI);
router.post('/api/onboarding/invoice-setup', invoiceSetupAPI);
router.post('/api/onboarding/wallet-sync', walletSyncAPI);
router.post('/api/onboarding/preferences', preferencesAPI);
router.get('/api/onboarding/summary', summaryAPI);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Optionally add authentication check here
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${env.USER_API_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    return router.handle(request, env, ctx);
  },
};
