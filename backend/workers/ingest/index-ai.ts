// workers/ingest/index-ai.js
// CSV Ingest Worker with AI categorization and Vectorize

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      const user = await authenticateRequest(request, env);

      if (path === '/upload' && request.method === 'POST') {
        return await handleCSVUpload(request, env, user, corsHeaders);
      }

      if (path === '/process' && request.method === 'POST') {
        return await handleCSVProcess(request, env, user, corsHeaders);
      }

      if (path === '/history' && request.method === 'GET') {
        return await handleUploadHistory(request, env, user, corsHeaders);
      }

      return jsonResponse({ error: 'Route not found' }, 404, corsHeaders);
    } catch (error) {
      console.error('Ingest Error:', error);
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }
  }
};

/* ---------------------------------------
 * CSV Parsing Helpers
 * ------------------------------------- */
function parseCSV(content) {
  try {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV must have at least header and one data row'
      };
    }

    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index].trim();
        });
        data.push(row);
      }
    }

    return { success: true, data, headers };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function validateCSV(data) {
  const errors = [];
  if (!data || data.length === 0) {
    errors.push('CSV is empty');
    return { valid: false, errors };
  }

  const headers = Object.keys(data[0]);
  const hasDate = headers.some(h => h.includes('date') || h.includes('posted'));
  const hasAmount = headers.some(h => h.includes('amount') || h.includes('value'));

  if (!hasDate) errors.push('Missing date column');
  if (!hasAmount) errors.push('Missing amount column');

  return { valid: errors.length === 0, errors };
}

function detectColumnMapping(headers) {
  const mapping = {};
  headers.forEach(header => {
    const lower = header.toLowerCase();
    if (!mapping.date && (lower.includes('date') || lower.includes('posted'))) mapping.date = header;
    if (!mapping.amount && (lower.includes('amount') || lower.includes('value'))) mapping.amount = header;
    if (!mapping.description && (lower.includes('description') || lower.includes('memo') || lower.includes('payee'))) mapping.description = header;
    if (!mapping.type && lower.includes('type')) mapping.type = header;
    if (!mapping.category && lower.includes('category')) mapping.category = header;
  });
  return mapping;
}

function parseDate(dateString) {
  if (!dateString) return new Date();
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;

  // Try MM/DD/YYYY
  const match = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    return new Date(match[3], match[1] - 1, match[2]);
  }
  return new Date();
}

function parseAmount(amountString) {
  if (typeof amountString === 'number') return amountString;
  if (!amountString) return 0;

  let cleaned = amountString.toString()
    .replace(/[$€£¥,\s]/g, '')
    .replace(/[()]/g, '');

  if (amountString.includes('(') && amountString.includes(')')) {
    cleaned = '-' + cleaned;
  }

  return parseFloat(cleaned) || 0;
}

function detectCategoryFallback(description) {
  const lower = description.toLowerCase();
  if (lower.includes('payroll') || lower.includes('salary')) return 'Payroll';
  if (lower.includes('rent')) return 'Rent';
  if (lower.includes('utility') || lower.includes('electric')) return 'Utilities';
  if (lower.includes('marketing') || lower.includes('ad')) return 'Marketing';
  if (lower.includes('software') || lower.includes('subscription')) return 'Software';
  if (lower.includes('travel') || lower.includes('flight')) return 'Travel';
  if (lower.includes('meal') || lower.includes('restaurant')) return 'Meals';
  if (lower.includes('insurance')) return 'Insurance';
  if (lower.includes('supply')) return 'Supplies';
  if (lower.includes('legal') || lower.includes('accounting')) return 'Professional Services';
  return 'Other Expenses';
}

/* ---------------------------------------
 * Auth & JSON Helpers
 * ------------------------------------- */
async function authenticateRequest(request, env) {
  const sessionId = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!sessionId) throw new Error('Unauthorized');

  const session = await env.KV.get(`session:${sessionId}`, 'json');
  if (!session) throw new Error('Invalid session');

  return session.user;
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

/* ---------------------------------------
 * Upload Handler
 * ------------------------------------- */
async function handleCSVUpload(request, env, user, corsHeaders) {
  const formData = await request.formData();
  const file = formData.get('file');
  const clientId = formData.get('clientId');

  if (!file || !clientId) {
    return jsonResponse({ error: 'File and client ID required' }, 400, corsHeaders);
  }

  const client = await env.DB.prepare(
    'SELECT id FROM clients WHERE id = ? AND user_id = ?'
  ).bind(clientId, user.id).first();

  if (!client) {
    return jsonResponse({ error: 'Client not found' }, 404, corsHeaders);
  }

  if (file.size > 10 * 1024 * 1024) {
    return jsonResponse({ error: 'File too large (max 10MB)' }, 400, corsHeaders);
  }

  if (!file.name.endsWith('.csv')) {
    return jsonResponse({ error: 'Only CSV files allowed' }, 400, corsHeaders);
  }

  const content = await file.text();
  const parsed = parseCSV(content);
  if (!parsed.success) {
    return jsonResponse({ error: `CSV parsing failed: ${parsed.error}` }, 400, corsHeaders);
  }

  const validation = validateCSV(parsed.data);
  if (!validation.valid) {
    return jsonResponse({ error: `Invalid CSV: ${validation.errors.join(', ')}` }, 400, corsHeaders);
  }

  const timestamp = Date.now();
  const r2Key = `uploads/${user.id}/${clientId}/${timestamp}-${file.name}`;
  await env.BUCKET.put(r2Key, content);

  const uploadId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO csv_uploads (id, user_id, client_id, filename, row_count, file_size, r2_key, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`
  ).bind(uploadId, user.id, clientId, file.name, parsed.data.length, file.size, r2Key).run();

  return jsonResponse({
    message: 'File uploaded successfully',
    uploadId,
    rowCount: parsed.data.length,
    preview: parsed.data.slice(0, 5)
  }, 201, corsHeaders);
}

/* ---------------------------------------
 * Processing Handler
 * ------------------------------------- */
async function handleCSVProcess(request, env, user, corsHeaders) {
  const { uploadId, clientId, columnMapping } = await request.json();
  if (!uploadId || !clientId) {
    return jsonResponse({ error: 'Upload ID and client ID required' }, 400, corsHeaders);
  }

  const upload = await env.DB.prepare(
    'SELECT * FROM csv_uploads WHERE id = ? AND user_id = ?'
  ).bind(uploadId, user.id).first();

  if (!upload) return jsonResponse({ error: 'Upload not found' }, 404, corsHeaders);
  if (upload.processed) return jsonResponse({ error: 'Upload already processed' }, 400, corsHeaders);

  const file = await env.BUCKET.get(upload.r2_key);
  if (!file) return jsonResponse({ error: 'File not found in storage' }, 404, corsHeaders);

  const content = await file.text();
  const parsed = parseCSV(content);

  const transactions = [];
  const embeddings = [];

  for (const row of parsed.data) {
    const transaction = await processTransactionWithAI(env, row, clientId, columnMapping);
    transactions.push(transaction);

    const embedding = await generateEmbedding(env, transaction.description);
    embeddings.push({
      id: transaction.id,
      values: embedding,
      metadata: {
        clientId,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.date
      }
    });
  }

  const placeholders = transactions.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())').join(',');
  const values = transactions.flatMap(t => [
    t.id, t.client_id, t.date, t.description, t.amount, t.type, t.category, t.confidence, t.ai_categorized
  ]);

  await env.DB.prepare(
    `INSERT INTO transactions (id, client_id, date, description, amount, type, category, confidence, ai_categorized, created_at) VALUES ${placeholders}`
  ).bind(...values).run();

  if (embeddings.length > 0) {
    await env.VECTORIZE.upsert(embeddings);
  }

  await env.DB.prepare(
    `UPDATE csv_uploads SET processed = 1, processed_at = unixepoch(), transactions_created = ? WHERE id = ?`
  ).bind(transactions.length, uploadId).run();

  return jsonResponse({
    message: 'Transactions processed successfully',
    transactionsCreated: transactions.length,
    aiCategorized: transactions.filter(t => t.ai_categorized).length
  }, 200, corsHeaders);
}

/* ---------------------------------------
 * Upload History
 * ------------------------------------- */
async function handleUploadHistory(request, env, user, corsHeaders) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit')) || 20;

  const { results } = await env.DB.prepare(
    'SELECT * FROM csv_uploads WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT ?'
  ).bind(user.id, limit).all();

  return jsonResponse({ uploads: results }, 200, corsHeaders);
}

/* ---------------------------------------
 * AI Categorization
 * ------------------------------------- */
async function processTransactionWithAI(env, row, clientId, columnMapping) {
  const mapping = columnMapping || detectColumnMapping(Object.keys(row));
  const date = parseDate(row[mapping.date]);
  const amount = parseAmount(row[mapping.amount]);
  const description = row[mapping.description] || 'Unknown';

  let type = 'expense';
  if (mapping.type && row[mapping.type]) {
    const typeValue = row[mapping.type].toLowerCase();
    if (typeValue.includes('credit') || typeValue.includes('income')) type = 'income';
  } else if (amount > 0) {
    type = 'income';
  }

  let category = row[mapping.category] || null;
  let confidence = 1.0;
  let aiCategorized = false;

  if (!category) {
    const aiResult = await categorizeWithAI(env, description, Math.abs(amount));
    category = aiResult.category;
    confidence = aiResult.confidence;
    aiCategorized = true;
  }

  return {
    id: crypto.randomUUID(),
    client_id: clientId,
    date: Math.floor(date.getTime() / 1000),
    description,
    amount: Math.abs(amount),
    type,
    category,
    confidence,
    ai_categorized: aiCategorized ? 1 : 0
  };
}

async function categorizeWithAI(env, description, amount) {
  try {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content:
            'You are a financial categorization expert. Categorize into: Payroll, Rent, Utilities, Marketing, Supplies, Insurance, Travel, Meals, Software, Professional Services, Sales, Services, Interest, Other Income, Other Expenses. Respond with ONLY the category name.'
        },
        { role: 'user', content: `"${description}" $${amount}` }
      ],
      max_tokens: 20
    });

    return {
      category: response.response.trim(),
      confidence: 0.85
    };
  } catch (error) {
    return {
      category: detectCategoryFallback(description),
      confidence: 0.6
    };
  }
}

async function generateEmbedding(env, text) {
  const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [text]
  });
  return response.data[0];
}
