import { getUserId } from '../auth';
import type { Env } from '../../types/env';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const userId = getUserId(request);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  if (!request.body) return new Response('No file uploaded', { status: 400 });

  // Get CSV file from request FormData
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return new Response('File missing', { status: 400 });

  const text = await file.text();

  // Simple CSV parser (or use library if bundle size permits)
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(',');

  const records = lines.slice(1).map(line => {
    const values = line.split(',');
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      record[header.trim()] = values[i]?.trim() || '';
    });
    return record;
  });

  // Store parsed CSV in KV for this user
  await env.ONBOARDING_KV.put(`${userId}:csvUploadedData`, JSON.stringify(records));

  // Optionally, process data with Worker AI (placeholder for actual integration)
  // await yourWorkerAI.process(records);

  return new Response(JSON.stringify({ success: true, recordsCount: records.length }), { status: 200 });
}
