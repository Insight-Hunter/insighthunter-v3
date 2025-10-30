// workers/analytics/pattern-insights.js
// Learn from patterns across all users using Vectorize

async function findSimilarFinancialSituations(vectorizeBinding, aiBinding, userSituation) {
  // userSituation is a text description of the current user's financial pattern
  // For example: "Marketing expenses growing 20% monthly while revenue flat for 3 months"
  
  // Convert this situation description to a vector
  const situationVector = await getTransactionEmbedding(userSituation, aiBinding);
  
  // Search for similar situations that other users have experienced
  const similarSituations = await vectorizeBinding.query(situationVector, {
    topK: 20,
    returnMetadata: true
  });
  
  // The metadata for each match includes information about what happened
  // after that situation: did revenue eventually grow? did they cut marketing?
  // what was the outcome?
  
  const insights = {
    similarsituations: similarSituations.matches.length,
    commonOutcomes: {},
    recommendations: []
  };
  
  // Analyze the outcomes from similar situations
  for (const match of similarSituations.matches) {
    const outcome = match.metadata.outcome;
    insights.commonOutcomes[outcome] = (insights.commonOutcomes[outcome] || 0) + 1;
  }
  
  // Generate recommendations based on what worked for others
  // This is simplified; in reality you'd have more sophisticated logic
  const successfulOutcomes = similarSituations.matches
    .filter(m => m.metadata.successful === true);
  
  if (successfulOutcomes.length > 0) {
    insights.recommendations.push({
      action: successfulOutcomes[0].metadata.action_taken,
      frequency: successfulOutcomes.length,
      confidence: successfulOutcomes.length / similarSituations.matches.length
    });
  }
  
  return insights;
}

export { findSimilarFinancialSituations };
