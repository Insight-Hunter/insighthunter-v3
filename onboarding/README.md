# Insight Hunter Onboarding Flow (TypeScript)

This repository contains the full TypeScript React onboarding flow implementation for Insight Hunter, including:

- Detailed multi-step forms for personal info, business setup, account connections, third-party payments, and invoice insights.
- Plaid integration for bank account connections.
- Placeholder OAuth buttons for Stripe, QuickBooks, Xero, and crypto accounts.
- Integration with Cloudflare Workflows for backend orchestration.
- Basic styling included.

## Setup

1. Clone the repo.

2. Install dependencies:
npm install

3. Replace the Plaid public key in `PlaidConnect.tsx` with your client key.

4. Update the onboarding API endpoint in `OnboardingFlow.tsx` to your Cloudflare Worker URL.

5. Run the dev server:
npm start


6. Open at `http://localhost:3000` and test onboarding.

## Components

- `PersonalInfoForm.tsx`: User personal info form.
- `BusinessSetupForm.tsx`: Business info form.
- `AccountConnectionForm.tsx`: CSV or Plaid bank connection.
- `ThirdPartyAccountsForm.tsx`: Payment and crypto OAuth placeholders.
- `InvoiceInsightsForm.tsx`: Invoice alert settings.
- `PlaidConnect.tsx`: React Plaid Link integration.
- `OnboardingFlow.tsx`: Multi-step form orchestration and submission.

## Extending

- Add full OAuth flows.
- Implement backend APIs with proper typings.
- Enhance validation, state management, error recovery.
- Add progress updates and polling UI.

## License

MIT
