// workers/ingest/transaction-categorization.js
// Intelligent transaction categorization using Vectorize

// ============================================================================
// TRANSACTION CATEGORIZATION
// Use Workers AI and Vectorize for intelligent categorization
// ============================================================================

// Convert text to embedding vector using Workers AI
async function getEmbedding(text, ai) {
try {
const response = await ai.run(’@cf/baai/bge-base-en-v1.5’, {
text: text
});

...
// The model returns embeddings in the data array
return response.data[0];
...

} catch (error) {
console.error(‘Error generating embedding:’, error);
return null;
}
}

// Suggest category based on similar transactions in Vectorize
async function suggestCategory(description, vectorize, ai) {
// Get the embedding for this transaction description
const embedding = await getEmbedding(description, ai);

if (!embedding) {
return { category: null, confidence: 0, method: ‘failed’ };
}

try {
// Query Vectorize for similar transactions
const results = await vectorize.query(embedding, {
topK: 10,
returnMetadata: true
});

...
if (!results.matches || results.matches.length === 0) {
  // No similar transactions found, fall back to rule-based categorization
  return categorizeByrules(description);
}

// Count category occurrences in the results
const categoryCounts = {};
let totalScore = 0;

for (const match of results.matches) {
  const category = match.metadata.category;
  const score = match.score;
  
  categoryCounts[category] = (categoryCounts[category] || 0) + score;
  totalScore += score;
}

// Find the category with the highest total score
let bestCategory = null;
let bestScore = 0;

for (const [category, score] of Object.entries(categoryCounts)) {
  if (score > bestScore) {
    bestScore = score;
    bestCategory = category;
  }
}

// Calculate confidence as the proportion of the total score
const confidence = totalScore > 0 ? bestScore / totalScore : 0;

return {
  category: bestCategory,
  confidence: confidence,
  method: 'vectorize',
  similarCount: results.matches.length
};
...

} catch (error) {
console.error(‘Error querying Vectorize:’, error);
// Fall back to rule-based categorization
return categorizeByRules(description);
}
}

// Fallback rule-based categorization when Vectorize isn’t available
function categorizeByRules(description) {
const desc = description.toLowerCase();

// Define keyword patterns for common categories
const patterns = {
‘Payroll’: [‘payroll’, ‘salary’, ‘wages’, ‘employee payment’],
‘Software’: [‘software’, ‘saas’, ‘subscription’, ‘aws’, ‘azure’, ‘google cloud’, ‘github’, ‘zoom’],
‘Marketing’: [‘advertising’, ‘marketing’, ‘facebook ads’, ‘google ads’, ‘social media’],
‘Office Supplies’: [‘office supplies’, ‘stationery’, ‘printer’, ‘paper’],
‘Rent’: [‘rent’, ‘lease’, ‘office space’],
‘Utilities’: [‘electricity’, ‘water’, ‘gas’, ‘internet’, ‘phone’],
‘Travel’: [‘hotel’, ‘flight’, ‘airfare’, ‘uber’, ‘lyft’, ‘rental car’],
‘Professional Services’: [‘consulting’, ‘legal’, ‘accounting’, ‘contractor’],
‘Equipment’: [‘computer’, ‘laptop’, ‘monitor’, ‘furniture’, ‘equipment’]
};

// Check each pattern
for (const [category, keywords] of Object.entries(patterns)) {
for (const keyword of keywords) {
if (desc.includes(keyword)) {
return {
category: category,
confidence: 0.7, // Rule-based has moderate confidence
method: ‘rules’
};
}
}
}

// Default category if nothing matches
return {
category: ‘Uncategorized’,
confidence: 0.3,
method: ‘default’
};
}

// Store transaction embedding in Vectorize for future learning
async function storeTransactionVector(vectorize, ai, transactionId, description, category) {
try {
const embedding = await getEmbedding(description, ai);

...
if (!embedding) {
  console.error('Failed to generate embedding for storage');
  return false;
}

await vectorize.insert([{
  id: transactionId.toString(),
  values: embedding,
  metadata: {
    category: category,
    description: description.substring(0, 200) // Truncate long descriptions
  }
}]);

return true;
...

} catch (error) {
console.error(‘Error storing vector:’, error);
return false;
}
}

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
