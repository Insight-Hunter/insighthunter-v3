// workers/ingest/index.js
// Complete CSV ingestion Worker for Insight Hunter
// Handles file uploads, parsing, categorization, and semantic intelligence

// ============================================================================
// SHARED UTILITIES AND HELPERS
// These would normally be imported from your shared directory
// ============================================================================

// JWT verification function to authenticate requests
async function verifyJWT(token, secret) {
try {
const [headerB64, payloadB64, signatureB64] = token.split(’.’);
const encoder = new TextEncoder();
const data = encoder.encode(`${headerB64}.${payloadB64}`);

```
const secretKey = await crypto.subtle.importKey(
  'raw',
  encoder.encode(secret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['verify']
);

const signatureBytes = Uint8Array.from(
  atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), 
  c => c.charCodeAt(0)
);

const isValid = await crypto.subtle.verify('HMAC', secretKey, signatureBytes, data);
if (!isValid) return null;

const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

// Check expiration
if (payload.exp < Math.floor(Date.now() / 1000)) return null;

return payload;
```

} catch (error) {
return null;
}
}

// Get user’s plan and check if they can perform an action
async function checkUploadLimit(db, userId, planType) {
const limits = {
free: { maxUploads: 5, maxTransactions: 500 },
professional: { maxUploads: 50, maxTransactions: 5000 },
enterprise: { maxUploads: null, maxTransactions: null }
};

const userLimits = limits[planType] || limits.free;

// If null, it means unlimited
if (userLimits.maxUploads === null) {
return { allowed: true, remaining: ‘unlimited’ };
}

// Count uploads this month
const monthStart = new Date();
monthStart.setDate(1);
monthStart.setHours(0, 0, 0, 0);

const result = await db.prepare(`SELECT COUNT(*) as count  FROM csv_uploads  WHERE user_id = ? AND uploaded_at >= ?`).bind(userId, monthStart.toISOString()).first();

const currentCount = result.count;
const allowed = currentCount < userLimits.maxUploads;

return {
allowed,
current: currentCount,
max: userLimits.maxUploads,
remaining: userLimits.maxUploads - currentCount
};
}

// ============================================================================
// CSV PARSING
// Parse CSV content and validate structure
// ============================================================================

function parseCSV(csvText) {
// Split into lines and handle different line ending styles
const lines = csvText.split(/\r?\n/).filter(line => line.trim());

if (lines.length === 0) {
throw new Error(‘CSV file is empty’);
}

// Parse the header row to identify columns
const headers = lines[0].split(’,’).map(h => h.trim().toLowerCase());

// Check for required columns with flexible matching
const dateColumn = headers.findIndex(h =>
h.includes(‘date’) || h.includes(‘transaction date’)
);
const amountColumn = headers.findIndex(h =>
h.includes(‘amount’) || h.includes(‘transaction amount’)
);
const descriptionColumn = headers.findIndex(h =>
h.includes(‘description’) || h.includes(‘memo’) || h.includes(‘details’)
);

if (dateColumn === -1 || amountColumn === -1 || descriptionColumn === -1) {
throw new Error(
’CSV must include date, amount, and description columns. ’ +
‘Found columns: ’ + headers.join(’, ’)
);
}

// Parse data rows
const transactions = [];

for (let i = 1; i < lines.length; i++) {
const line = lines[i];
if (!line.trim()) continue;

```
// Simple CSV parsing - in production you'd want a more robust parser
// that handles quoted fields with commas
const values = line.split(',').map(v => v.trim());

// Skip rows that don't have enough columns
if (values.length <= Math.max(dateColumn, amountColumn, descriptionColumn)) {
  continue;
}

const date = values[dateColumn];
const amount = parseFloat(values[amountColumn].replace(/[^0-9.-]/g, ''));
const description = values[descriptionColumn];

// Validate the parsed data
if (!date || isNaN(amount) || !description) {
  continue; // Skip invalid rows
}

transactions.push({
  date: normalizeDate(date),
  amount,
  description,
  rawLine: line
});
```

}

return transactions;
}

// Normalize date strings to ISO format
function normalizeDate(dateStr) {
// Try to parse various date formats
// This is simplified - in production you’d use a proper date parsing library
const date = new Date(dateStr);

if (isNaN(date.getTime())) {
// If the date couldn’t be parsed, return the original string
// The database will reject it and we’ll catch the error
return dateStr;
}

return date.toISOString().split(‘T’)[0]; // Return YYYY-MM-DD format
}

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

```
// The model returns embeddings in the data array
return response.data[0];
```

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

```
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
```

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

```
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
```

} catch (error) {
console.error(‘Error storing vector:’, error);
return false;
}
}

// ============================================================================
// MAIN WORKER HANDLER
// Process incoming requests
// ============================================================================

export default {
async fetch(request, env) {
const url = new URL(request.url);

```
// Handle CORS preflight requests
if (request.method === 'OPTIONS') {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// ========================================================================
// CSV UPLOAD ENDPOINT
// POST /api/upload
// ========================================================================

if (url.pathname === '/api/upload' && request.method === 'POST') {
  try {
    // Step 1: Authenticate the request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);
    
    if (!payload) {
      return new Response(JSON.stringify({
        error: 'Invalid or expired token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const userId = payload.userId;
    
    // Step 2: Get user's plan and check upload limits
    const user = await env.DB.prepare(
      'SELECT plan_type FROM users WHERE id = ?'
    ).bind(userId).first();
    
    if (!user) {
      return new Response(JSON.stringify({
        error: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const uploadCheck = await checkUploadLimit(env.DB, userId, user.plan_type);
    
    if (!uploadCheck.allowed) {
      return new Response(JSON.stringify({
        error: 'Upload limit reached for your plan',
        limit: uploadCheck.max,
        current: uploadCheck.current,
        planType: user.plan_type,
        upgradeMessage: 'Upgrade to Professional or Enterprise for more uploads'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Step 3: Parse the multipart form data to get the file
    const formData = await request.formData();
    const file = formData.get('file');
    const clientId = formData.get('client_id');
    
    if (!file) {
      return new Response(JSON.stringify({
        error: 'No file provided'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check file size
    if (file.size > env.MAX_FILE_SIZE) {
      return new Response(JSON.stringify({
        error: 'File too large',
        maxSize: env.MAX_FILE_SIZE,
        actualSize: file.size
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Step 4: Read and parse the CSV file
    const csvText = await file.text();
    
    let transactions;
    try {
      transactions = parseCSV(csvText);
    } catch (parseError) {
      return new Response(JSON.stringify({
        error: 'Failed to parse CSV file',
        details: parseError.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (transactions.length === 0) {
      return new Response(JSON.stringify({
        error: 'No valid transactions found in CSV'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Step 5: Store the original file in R2 for audit trail
    const uploadDate = new Date().toISOString();
    const filename = `${userId}/${uploadDate}-${file.name}`;
    
    await env.STORAGE.put(filename, file);
    
    // Step 6: Create a record of this upload in the database
    const uploadResult = await env.DB.prepare(`
      INSERT INTO csv_uploads 
      (user_id, client_id, filename, file_size, row_count, uploaded_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      clientId || null,
      file.name,
      file.size,
      transactions.length,
      uploadDate,
      'processing'
    ).run();
    
    const uploadId = uploadResult.meta.last_row_id;
    
    // Step 7: Process each transaction
    const processedTransactions = [];
    const categorizationStats = {
      vectorize: 0,
      rules: 0,
      default: 0
    };
    
    for (const transaction of transactions) {
      // Categorize the transaction using Vectorize and AI
      const categorization = await suggestCategory(
        transaction.description,
        env.VECTORIZE,
        env.AI
      );
      
      // Track which method was used
      categorizationStats[categorization.method]++;
      
      // Determine transaction type based on amount
      const transactionType = transaction.amount >= 0 ? 'income' : 'expense';
      
      // Insert the transaction into the database
      try {
        const transactionResult = await env.DB.prepare(`
          INSERT INTO transactions
          (user_id, client_id, csv_file_id, date, amount, description, category, transaction_type, uploaded_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          userId,
          clientId || null,
          uploadId,
          transaction.date,
          transaction.amount,
          transaction.description,
          categorization.category,
          transactionType,
          uploadDate
        ).run();
        
        const transactionId = transactionResult.meta.last_row_id;
        
        // If categorization confidence is high, store this in Vectorize
        // for future learning (only if it came from Vectorize initially
        // to avoid creating circular feedback)
        if (categorization.confidence > 0.8 && categorization.method === 'vectorize') {
          await storeTransactionVector(
            env.VECTORIZE,
            env.AI,
            transactionId,
            transaction.description,
            categorization.category
          );
        }
        
        processedTransactions.push({
          id: transactionId,
          date: transaction.date,
          amount: transaction.amount,
          description: transaction.description,
          category: categorization.category,
          confidence: categorization.confidence
        });
        
      } catch (dbError) {
        console.error('Error inserting transaction:', dbError);
        // Continue processing other transactions even if one fails
      }
    }
    
    // Step 8: Update the upload record to mark as complete
    await env.DB.prepare(`
      UPDATE csv_uploads
      SET status = ?, processed_at = ?
      WHERE id = ?
    `).bind('completed', new Date().toISOString(), uploadId).run();
    
    // Step 9: Return success response with summary
    return new Response(JSON.stringify({
      success: true,
      uploadId: uploadId,
      filename: file.name,
      totalTransactions: transactions.length,
      processedTransactions: processedTransactions.length,
      categorizationStats: categorizationStats,
      transactions: processedTransactions.slice(0, 10), // Return first 10 for preview
      message: 'CSV processed successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ========================================================================
// GET TRANSACTIONS ENDPOINT
// GET /api/transactions
// ========================================================================

if (url.pathname === '/api/transactions' && request.method === 'GET') {
  try {
    // Authenticate
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const userId = payload.userId;
    
    // Parse query parameters
    const params = new URL(request.url).searchParams;
    const clientId = params.get('client_id');
    const startDate = params.get('start_date');
    const endDate = params.get('end_date');
    const category = params.get('category');
    const limit = parseInt(params.get('limit') || '100');
    
    // Build the query with optional filters
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const bindings = [userId];
    
    if (clientId) {
      query += ' AND client_id = ?';
      bindings.push(clientId);
    }
    
    if (startDate) {
      query += ' AND date >= ?';
      bindings.push(startDate);
    }
    
    if (endDate) {
      query += ' AND date <= ?';
      bindings.push(endDate);
    }
    
    if (category) {
      query += ' AND category = ?';
      bindings.push(category);
    }
    
    query += ' ORDER BY date DESC LIMIT ?';
    bindings.push(limit);
    
    const result = await env.DB.prepare(query).bind(...bindings).all();
    
    return new Response(JSON.stringify({
      success: true,
      transactions: result.results,
      count: result.results.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch transactions',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ========================================================================
// UPDATE TRANSACTION CATEGORY
// POST /api/transactions/:id/category
// Allows users to correct AI categorization
// ========================================================================

if (url.pathname.match(/^\/api\/transactions\/\d+\/category$/) && request.method === 'POST') {
  try {
    // Authenticate
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const userId = payload.userId;
    const transactionId = url.pathname.split('/')[3];
    const { category } = await request.json();
    
    if (!category) {
      return new Response(JSON.stringify({ error: 'Category is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify the transaction belongs to this user
    const transaction = await env.DB.prepare(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
    ).bind(transactionId, userId).first();
    
    if (!transaction) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update the category
    await env.DB.prepare(
      'UPDATE transactions SET category = ? WHERE id = ?'
    ).bind(category, transactionId).run();
    
    // Store the corrected categorization in Vectorize to improve future suggestions
    // This is crucial for learning from user corrections
    await storeTransactionVector(
      env.VECTORIZE,
      env.AI,
      transactionId,
      transaction.description,
      category
    );
    
    return new Response(JSON.stringify({
      success: true,
      transactionId: transactionId,
      category: category,
      message: 'Category updated and stored for learning'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Error updating category:', error);
    return new Response(JSON.stringify({
      error: 'Failed to update category',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Default 404 response for unmatched routes
return new Response(JSON.stringify({
  error: 'Not found',
  path: url.pathname
}), {
  status: 404,
  headers: { 'Content-Type': 'application/json' }
});
```

}
};
