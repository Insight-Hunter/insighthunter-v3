// workers/analytics/semantic-search.js
// Semantic search across financial transactions using Vectorize

async function searchTransactions(vectorizeBinding, dbBinding, aiBinding, userId, searchQuery, clientId = null) {
  // Convert the user's search query into a vector
  // This captures what they're looking for semantically
  const queryVector = await getTransactionEmbedding(searchQuery, aiBinding);
  
  // Search Vectorize for transactions similar to the query
  // We ask for 50 results to give a good pool of matches
  const vectorResults = await vectorizeBinding.query(queryVector, {
    topK: 50,
    returnMetadata: true,
    filter: clientId ? { clientId: clientId } : undefined
  });
  
  // The vector search gives us transaction IDs ranked by semantic similarity
  // Now we need to fetch the full transaction details from D1
  const transactionIds = vectorResults.matches.map(m => parseInt(m.id));
  
  // Build a SQL query to get the full transaction data
  // We use IN clause to fetch all matching transactions at once
  const placeholders = transactionIds.map(() => '?').join(',');
  const query = `
    SELECT id, date, amount, description, category, transaction_type
    FROM transactions
    WHERE id IN (${placeholders})
    AND user_id = ?
    ORDER BY date DESC
  `;
  
  const transactions = await dbBinding.prepare(query)
    .bind(...transactionIds, userId)
    .all();
  
  // Combine the semantic similarity scores with the transaction data
  const resultsWithScores = transactions.results.map(transaction => {
    const vectorMatch = vectorResults.matches.find(m => parseInt(m.id) === transaction.id);
    return {
      ...transaction,
      relevanceScore: vectorMatch ? vectorMatch.score : 0
    };
  });
  
  // Sort by relevance score so the most semantically similar results come first
  resultsWithScores.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  return resultsWithScores;
}

// Find anomalous transactions that don't match expected patterns
async function detectAnomalousTransactions(vectorizeBinding, dbBinding, aiBinding, userId, clientId = null) {
  // Get all recent transactions for this user or client
  const recentTransactions = await dbBinding.prepare(`
    SELECT id, description, category, amount
    FROM transactions
    WHERE user_id = ?
    ${clientId ? 'AND client_id = ?' : ''}
    AND date >= date('now', '-90 days')
    ORDER BY date DESC
  `).bind(clientId ? [userId, clientId] : [userId]).all();
  
  const anomalies = [];
  
  // For each transaction, check how similar it is to other transactions in its category
  for (const transaction of recentTransactions.results) {
    // Get the vector for this transaction
    const transactionVector = await getTransactionEmbedding(transaction.description, aiBinding);
    
    // Find similar transactions in the same category
    const similarInCategory = await vectorizeBinding.query(transactionVector, {
      topK: 10,
      returnMetadata: true,
      filter: { category: transaction.category }
    });
    
    // Calculate the average similarity score
    const avgSimilarity = similarInCategory.matches.reduce((sum, m) => sum + m.score, 0) / similarInCategory.matches.length;
    
    // If this transaction is much less similar to its category peers than expected,
    // it might be miscategorized or genuinely anomalous
    if (avgSimilarity < 0.7) {
      anomalies.push({
        transaction: transaction,
        averageSimilarity: avgSimilarity,
        reason: 'Transaction description unusual for its category',
        suggestion: 'Review category assignment or investigate unusual expense'
      });
    }
  }
  
  return anomalies;
}

export { searchTransactions, detectAnomalousTransactions };
