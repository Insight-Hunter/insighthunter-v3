// ============================================================================
// INSIGHT GENERATION
// Use Workers AI to create natural language explanations
// ============================================================================

async function generateInsights(ai, monthlyData, forecasts, categoryBreakdown) {
// Prepare a summary of the financial situation
const recentMonths = monthlyData.slice(-3);
const recentRevenue = recentMonths.map(m => m.revenue);
const recentExpenses = recentMonths.map(m => m.expenses);

const avgRevenue = mean(recentRevenue);
const avgExpenses = mean(recentExpenses);
const avgProfit = avgRevenue - avgExpenses;

// Calculate trends
const revenueTrend = recentRevenue[2] > recentRevenue[0] ? 
'increasing' : 'decreasing';
const expenseTrend = recentExpenses[2] > recentExpenses[0] ? 'increasing' : 'decreasing';

// Top expense categories
const topCategories = categoryBreakdown.slice(0, 3)
.map(c => '${c.category} ($${c.total.toFixed(0)})')
.join(', ');

// Create a prompt for the AI
const prompt = `As a financial advisor, provide 3-4 concise insights about this business:

Recent Performance:

- Average monthly revenue: $${avgRevenue.toFixed(0)}
- Average monthly expenses: $${avgExpenses.toFixed(0)}
- Average monthly profit: $${avgProfit.toFixed(0)}
- Revenue trend: ${revenueTrend}
- Expense trend: ${expenseTrend}
- Top expense categories: ${topCategories}

Forecast:

- Next month revenue prediction: $${forecasts.revenue.forecasts[0]?.value || 0}
- Forecast confidence: ${(forecasts.revenue.confidence * 100).toFixed(0)}%

Provide specific, actionable insights in bullet point format. Focus on what"s working well, what needs attention, and what actions to consider.`;

try {
const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
prompt: prompt,
max_tokens: 500
});


// Extract insights from AI response
const aiText = response.response || '';

// Parse bullet points from AI response
const insights = aiText
  .split('\n')
  .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
  .map(line => line.replace(/^[-•]\s*/, '').trim())
  .filter(line => line.length > 10); // Filter out very short lines

return insights.length > 0 ? insights : [
  'Revenue is trending ' + revenueTrend,
  'Expenses are trending ' + expenseTrend,
  `Top expense category is ${categoryBreakdown[0]?.category || 'unknown'}`
];


} catch (error) {
console.error('AI insight generation error', error);
// Return basic insights if AI fails
return [
`Revenue is ${revenueTrend} with an average of $${avgRevenue.toFixed(0)} per month`,
`Expenses are ${expenseTrend} with an average of $${avgExpenses.toFixed(0)} per month`,
`Net profit margin is ${((avgProfit / avgRevenue) * 100).toFixed(1)}%`
];
}
}
