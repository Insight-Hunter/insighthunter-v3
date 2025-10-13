// shared/database-helpers.js
// Common database queries and utilities for Supabase

import { createClient } from ‘@supabase/supabase-js’;

// Initialize Supabase client
export function getSupabaseClient(env) {
return createClient(
env.SUPABASE_URL,
env.SUPABASE_KEY
);
}

/**

- User Management
  */

export async function getUserById(supabase, userId) {
const { data, error } = await supabase
.from(‘users’)
.select(’*’)
.eq(‘id’, userId)
.single();

if (error) throw error;
return data;
}

export async function getUserByEmail(supabase, email) {
const { data, error } = await supabase
.from(‘users’)
.select(’*’)
.eq(‘email’, email)
.single();

if (error && error.code !== ‘PGRST116’) throw error; // PGRST116 = not found
return data;
}

export async function createUser(supabase, userData) {
const { data, error } = await supabase
.from(‘users’)
.insert([{
email: userData.email,
password_hash: userData.passwordHash,
name: userData.name,
plan: userData.plan || ‘free’,
created_at: new Date().toISOString()
}])
.select()
.single();

if (error) throw error;
return data;
}

export async function updateUser(supabase, userId, updates) {
const { data, error } = await supabase
.from(‘users’)
.update(updates)
.eq(‘id’, userId)
.select()
.single();

if (error) throw error;
return data;
}

/**

- Client Management
  */

export async function getClientsByUserId(supabase, userId) {
const { data, error } = await supabase
.from(‘clients’)
.select(’*’)
.eq(‘user_id’, userId)
.order(‘created_at’, { ascending: false });

if (error) throw error;
return data;
}

export async function getClientById(supabase, clientId, userId) {
const { data, error } = await supabase
.from(‘clients’)
.select(’*’)
.eq(‘id’, clientId)
.eq(‘user_id’, userId)
.single();

if (error) throw error;
return data;
}

export async function createClient(supabase, userId, clientData) {
const { data, error } = await supabase
.from(‘clients’)
.insert([{
user_id: userId,
name: clientData.name,
email: clientData.email,
company: clientData.company,
portal_access: clientData.portalAccess || false,
created_at: new Date().toISOString()
}])
.select()
.single();

if (error) throw error;
return data;
}

/**

- Transaction Management
  */

export async function getTransactionsByClient(supabase, clientId, options = {}) {
let query = supabase
.from(‘transactions’)
.select(’*’)
.eq(‘client_id’, clientId);

if (options.startDate) {
query = query.gte(‘date’, options.startDate);
}

if (options.endDate) {
query = query.lte(‘date’, options.endDate);
}

if (options.type) {
query = query.eq(‘type’, options.type);
}

query = query.order(‘date’, { ascending: false });

if (options.limit) {
query = query.limit(options.limit);
}

const { data, error } = await query;

if (error) throw error;
return data;
}

export async function bulkInsertTransactions(supabase, transactions) {
const { data, error } = await supabase
.from(‘transactions’)
.insert(transactions)
.select();

if (error) throw error;
return data;
}

/**

- Report Management
  */

export async function getReportsByClient(supabase, clientId, limit = 10) {
const { data, error } = await supabase
.from(‘reports’)
.select(’*’)
.eq(‘client_id’, clientId)
.order(‘created_at’, { ascending: false })
.limit(limit);

if (error) throw error;
return data;
}

export async function createReport(supabase, reportData) {
const { data, error } = await supabase
.from(‘reports’)
.insert([{
client_id: reportData.clientId,
user_id: reportData.userId,
type: reportData.type,
data: reportData.data,
period_start: reportData.periodStart,
period_end: reportData.periodEnd,
created_at: new Date().toISOString()
}])
.select()
.single();

if (error) throw error;
return data;
}

/**

- Forecast Management
  */

export async function getForecastsByClient(supabase, clientId) {
const { data, error } = await supabase
.from(‘forecasts’)
.select(’*’)
.eq(‘client_id’, clientId)
.order(‘created_at’, { ascending: false });

if (error) throw error;
return data;
}

export async function createForecast(supabase, forecastData) {
const { data, error } = await supabase
.from(‘forecasts’)
.insert([{
client_id: forecastData.clientId,
type: forecastData.type,
predictions: forecastData.predictions,
confidence: forecastData.confidence,
period_months: forecastData.periodMonths,
created_at: new Date().toISOString()
}])
.select()
.single();

if (error) throw error;
return data;
}

/**

- Alert Management
  */

export async function getAlertsByUser(supabase, userId, unreadOnly = false) {
let query = supabase
.from(‘alerts’)
.select(’*’)
.eq(‘user_id’, userId);

if (unreadOnly) {
query = query.eq(‘read’, false);
}

query = query.order(‘created_at’, { ascending: false });

const { data, error } = await query;

if (error) throw error;
return data;
}

export async function createAlert(supabase, alertData) {
const { data, error } = await supabase
.from(‘alerts’)
.insert([{
user_id: alertData.userId,
client_id: alertData.clientId,
type: alertData.type,
severity: alertData.severity,
message: alertData.message,
data: alertData.data,
read: false,
created_at: new Date().toISOString()
}])
.select()
.single();

if (error) throw error;
return data;
}

export async function markAlertAsRead(supabase, alertId, userId) {
const { data, error } = await supabase
.from(‘alerts’)
.update({ read: true })
.eq(‘id’, alertId)
.eq(‘user_id’, userId)
.select()
.single();

if (error) throw error;
return data;
}

/**

- Usage Tracking
  */

export async function getUsageStats(supabase, userId) {
const now = new Date();
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

// Get various usage counts
const [clients, reportsThisMonth, uploadsThisMonth] = await Promise.all([
supabase.from(‘clients’).select(‘id’, { count: ‘exact’ }).eq(‘user_id’, userId),
supabase.from(‘reports’).select(‘id’, { count: ‘exact’ }).eq(‘user_id’, userId).gte(‘created_at’, firstDayOfMonth),
supabase.from(‘csv_uploads’).select(‘id’, { count: ‘exact’ }).eq(‘user_id’, userId).gte(‘uploaded_at’, firstDayOfMonth)
]);

return {
clientCount: clients.count || 0,
reportsThisMonth: reportsThisMonth.count || 0,
csvUploadsThisMonth: uploadsThisMonth.count || 0
};
}

/**

- CSV Upload Tracking
  */

export async function recordCSVUpload(supabase, uploadData) {
const { data, error } = await supabase
.from(‘csv_uploads’)
.insert([{
user_id: uploadData.userId,
client_id: uploadData.clientId,
filename: uploadData.filename,
row_count: uploadData.rowCount,
file_size: uploadData.fileSize,
storage_path: uploadData.storagePath,
uploaded_at: new Date().toISOString()
}])
.select()
.single();

if (error) throw error;
return data;
}
