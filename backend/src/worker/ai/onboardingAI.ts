export async function generatePersonalizedInsights(onboardingData: any): Promise<string> {
  // Sample prompt construction with onboarding data (business, accounts, preferences)
  const prompt = `
You are an expert financial advisor for small businesses. Given the following onboarding info:

Business Info:
Company: ${onboardingData.businessInfo.companyName}
Industry: ${onboardingData.businessInfo.industry}

Accounts connected: ${onboardingData.accountConnections.map((acc: any) => acc.accountType).join(', ')}

Preferences: Email notifications enabled: ${onboardingData.preferences.notifyEmail ? 'Yes' : 'No'}, Report Frequency: ${onboardingData.preferences.reportFrequency}

Please provide a personalized welcome message and 3 actionable financial insights tailored to this user.
`;

  // Call Workers AI OpenAI or built-in model interface
  const response = await fetch('https://gateway.ai.cloudflare.com/v1/18c8e61a3669253dcfd0c7eec6be36a3/gateway-ai/openai/chat/completions', {
    method: 'POST',
    headers: {
        'cf-aig-authorization': `Bearer ${process.env.WORKERS_AI_API_KEY}`,
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json' },

    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 300
    }),
  });

  if (!response.ok) {
    throw new Error('AI generation failed');
  }

  const json = await response.json() as { result?: string };
  return json.result || 'Welcome to Insight Hunter!';
}
