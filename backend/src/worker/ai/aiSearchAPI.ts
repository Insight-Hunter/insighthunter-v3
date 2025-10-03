import { Env } from "../../types/env";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const { query, userId } = await request.json() as { query: string; userId: string };

  // Get query embedding
  const qembed = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: query });

  // Search vectors
  const search = await env.VECTOR_DB.query({
    vector: qembed.data,
    topK: 3, // top 3 relevant chunks
    filter: { userId }
  });

  return new Response(JSON.stringify(search.matches), { status: 200 });
}
