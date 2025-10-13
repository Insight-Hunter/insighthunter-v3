// workers/ingest/index.js
// Data ingestion Worker - handles CSV uploads and processing

import { parseCSV, validateTransactionCSV, normalizeTransactionData } from ‘./csv-parser.js’;
import { authenticateRequest, createErrorResponse, createSuccessResponse } from ‘../../shared/auth-helpers.js’;
import { getSupabaseClient, bulkInsertTransactions, recordCSVUpload, getClientById } from ‘../../shared/database-helpers.js’;
import { canPerformAction } from ‘../../shared/permissions.js’;
import { CORS_HEADERS, HTTP_STATUS, FILE_SIZE_LIMITS, ERROR_MESSAGES } from ‘../../shared/constants.js’;

export default {
async fetch(request, env, ctx) {
// Handle CORS preflight
if (request.method === ‘OPTIONS’) {
return new Response(null, { headers: CORS_HEADERS });
}

```
const url = new URL(request.url);
const path = url.pathname;

try {
  // Authenticate all requests
  const user = await authenticateRequest(request);

  // Route requests
  if (path === '/upload' && request.method === 'POST') {
    return await handleCSVUpload(request, env, user);
  }

  if (path === '/process' && request.method === 'POST') {
    return await handleCSVProcess(request, env, user);
  }

  if (path === '/history' && request.method === 'GET') {
    return await handleUploadHistory(request, env, user);
  }

  return createErrorResponse('Route not found', HTTP_STATUS.NOT_FOUND);

} catch (error) {
  console.error('Ingest Worker Error:', error);
  
  if (error.message.includes('Authentication')) {
    return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  
  return createErrorResponse(
    error.message || 'Internal server error',
    HTTP_STATUS.INTERNAL_ERROR
  );
}
```

}
};

/**

- Handle CSV file upload
  */
  async function handleCSVUpload(request, env, user) {
  const supabase = getSupabaseClient(env);

// Check if user can upload CSV
const permission = canPerformAction(user, ‘uploadCSV’);
if (!permission.allowed) {
return createErrorResponse(permission.reason, HTTP_STATUS.FORBIDDEN);
}

const formData = await request.formData();
const file = formData.get(‘file’);
const clientId = formData.get(‘clientId’);

if (!file) {
return createErrorResponse(‘No file provided’, HTTP_STATUS.BAD_REQUEST);
}

if (!clientId) {
return createErrorResponse(‘Client ID is required’, HTTP_STATUS.BAD_REQUEST);
}

// Verify client belongs to user
const client = await getClientById(supabase, clientId, user.id);
if (!client) {
return createErrorResponse(‘Client not found’, HTTP_STATUS.NOT_FOUND);
}

// Check file size
if (file.size > FILE_SIZE_LIMITS.CSV_MAX_SIZE) {
return createErrorResponse(ERROR_MESSAGES.FILE_TOO_LARGE, HTTP_STATUS.BAD_REQUEST);
}

// Check file type
if (!file.name.endsWith(’.csv’)) {
return createErrorResponse(‘Only CSV files are allowed’, HTTP_STATUS.BAD_REQUEST);
}

// Read and parse CSV
const fileContent = await file.text();
const parseResult = await parseCSV(fileContent);

if (!parseResult.success) {
return createErrorResponse(
`CSV parsing failed: ${parseResult.error}`,
HTTP_STATUS.BAD_REQUEST
);
}

// Validate CSV structure
const validation = validateTransactionCSV(parseResult.data);
if (!validation.valid) {
return createErrorResponse(
`Invalid CSV structure: ${validation.errors.join(', ')}`,
HTTP_STATUS.BAD_REQUEST
);
}

// Store file in Cloudflare R2
const timestamp = Date.now();
const storagePath = `uploads/${user.id}/${clientId}/${timestamp}-${file.name}`;

await env.R2_BUCKET.put(storagePath, fileContent);

// Record upload in database
const uploadRecord = await recordCSVUpload(supabase, {
userId: user.id,
clientId,
filename: file.name,
rowCount: parseResult.data.length,
fileSize: file.size,
storagePath
});

return createSuccessResponse({
message: ‘File uploaded successfully’,
uploadId: uploadRecord.id,
rowCount: parseResult.data.length,
preview: parseResult.data.slice(0, 5) // First 5 rows
}, HTTP_STATUS.CREATED);
}

/**

- Process uploaded CSV and insert transactions
  */
  async function handleCSVProcess(request, env, user) {
  const supabase = getSupabaseClient(env);
  const body = await request.json();
  const { uploadId, clientId, columnMapping } = body;

if (!uploadId || !clientId) {
return createErrorResponse(‘Upload ID and Client ID are required’, HTTP_STATUS.BAD_REQUEST);
}

// Get upload record
const { data: upload, error: uploadError } = await supabase
.from(‘csv_uploads’)
.select(’*’)
.eq(‘id’, uploadId)
.eq(‘user_id’, user.id)
.single();

if (uploadError || !upload) {
return createErrorResponse(‘Upload not found’, HTTP_STATUS.NOT_FOUND);
}

// Retrieve file from R2
const file = await env.R2_BUCKET.get(upload.storage_path);
if (!file) {
return createErrorResponse(‘File not found in storage’, HTTP_STATUS.NOT_FOUND);
}

const fileContent = await file.text();
const parseResult = await parseCSV(fileContent);

if (!parseResult.success) {
return createErrorResponse(‘Failed to parse CSV’, HTTP_STATUS.INTERNAL_ERROR);
}

// Normalize transaction data
const transactions = normalizeTransactionData(
parseResult.data,
clientId,
columnMapping
);

// Validate transactions
if (transactions.length === 0) {
return createErrorResponse(‘No valid transactions found’, HTTP_STATUS.BAD_REQUEST);
}

// Insert transactions in batches
const batchSize = 100;
let inserted = 0;

for (let i = 0; i < transactions.length; i += batchSize) {
const batch = transactions.slice(i, i + batchSize);
await bulkInsertTransactions(supabase, batch);
inserted += batch.length;
}

// Update upload status
await supabase
.from(‘csv_uploads’)
.update({
processed: true,
processed_at: new Date().toISOString(),
transactions_created: inserted
})
.eq(‘id’, uploadId);

return createSuccessResponse({
message: ‘Transactions processed successfully’,
transactionsCreated: inserted,
clientId
});
}

/**

- Get upload history
  */
  async function handleUploadHistory(request, env, user) {
  const supabase = getSupabaseClient(env);
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get(‘limit’)) || 20;

const { data: uploads, error } = await supabase
.from(‘csv_uploads’)
.select(’*’)
.eq(‘user_id’, user.id)
.order(‘uploaded_at’, { ascending: false })
.limit(limit);

if (error) {
throw error;
}

return createSuccessResponse({
uploads: uploads || []
});
}
