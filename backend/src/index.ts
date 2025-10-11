import { Hono } from 'hono'
import onboarding from './worker/onboarding'

const app = new Hono()

// --- Mount onboarding routes under /onboarding ---
app.route('/onboarding', onboarding)

// --- Root health check ---
app.get('/', (c) => c.text('Insight Hunter API is running'))

export default app