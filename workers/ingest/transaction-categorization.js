// workers/ingest/transaction-categorization.js
// Intelligent transaction categorization using Vectorize

// Convert transaction description to a vector using Workers AI
async function getTransactionEmbedding(description, aiBinding) {
  // We use a text embedding model to convert the description into a vector
  // This vector captures the semantic meaning of the description
  const embeddings = await aiBinding.run('@cf/baai/bge-base-en-v1.5', {
    text: description
  });
  
  // The model returns an array of 384 numbers representing the meaning
  return embeddings.data[0];
}

// Store a categorized transaction in Vectorize for future reference
async function storeTransactionVector(vectorizeBinding, transactionId, description, category, aiBinding) {
  // First, convert the description to a vector
  const vector = await getTransactionEmbedding(description, aiBinding);
  
  // Store it in Vectorize with metadata about the category
  // The id is the transaction ID from your database
  // The vector is the embedding we just generated
  // The metadata includes the category and description for reference
  await vectorizeBinding.insert([
    {
      id: transactionId.toString(),
      values: vector,
      metadata: {
        category: category,
        description: description,
        // We could include other useful metadata like business type or amount range
      }
    }
  ]);
}

// Find the most likely category for a new transaction
async function suggestTransactionCategory(vectorizeBinding, description, aiBinding) {
  // Convert the new transaction description to a vector
  const queryVector = await getTransactionEmbedding(description, aiBinding);
  
  // Search Vectorize for the most similar transactions
  // topK of 10 means we want the 10 most similar matches
  // returnMetadata true means we get the category information back
  const results = await vectorizeBinding.query(queryVector, {
    topK: 10,
    returnMetadata: true
  });
  
  // If we didn't find any similar transactions, we can't suggest anything
  if (!results.matches || results.matches.length === 0) {
    return null;
  }
  
  // Count how many times each category appears in the top matches
  // The category that appears most often is probably the right one
  const categoryCounts = {};
  for (const match of results.matches) {
    const category = match.metadata.category;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }
  
  // Find the most common category
  let bestCategory = null;
  let maxCount = 0;
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      bestCategory = category;
    }
  }
  
  // Calculate a confidence score based on how many matches agreed
  // If 8 out of 10 matches had the same category, confidence is 0.8
  const confidence = maxCount / results.matches.length;
  
  // Return the suggestion with confidence information
  return {
    category: bestCategory,
    confidence: confidence,
    similarTransactions: results.matches.slice(0, 3).map(m => ({
      description: m.metadata.description,
      category: m.metadata.category,
      similarity: m.score
    }))
  };
}

export { getTransactionEmbedding, storeTransactionVector, suggestTransactionCategory };
