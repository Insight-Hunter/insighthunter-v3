export async function savePersonalInfo(data: any) {
  // Validate and insert to DB
  // Example: await db.users.update({ ...data });
}
export async function saveBusinessSetup(data: any) {
  // Validate and insert to DB
}
export async function processCsvData(csvData: any) {
  // Parse and store csvData
}
export async function linkPlaidAccount(userId: string, token: string) {
  // Store token, initiate sync
}
export async function saveThirdPartyTokens(userId: string, tokens: any) {
  // Store and validate API tokens
}
export async function saveInvoiceSettings(userId: string, invoiceSettings: any) {
  // Store invoice settings
}
export async function markOnboardingComplete(userId: string) {
  // Mark user onboarding as complete and kick off dashboard jobs
}
