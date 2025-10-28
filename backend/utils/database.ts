export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export async function paginate<T>(
  db: D1Database,
  query: string,
  params: any[],
  page: number = 1,
  limit: number = 50
): Promise<{  T[]; total: number; page: number; pages: number }> {
  const offset = (page - 1) * limit;

  // Get total count by replacing SELECT * with SELECT COUNT(*)
  const countQuery = query.replace(/SELECT\s+\*/i, 'SELECT COUNT(*) as count');

  const countResult = await db.prepare(countQuery).bind(...params).first<{ count: number }>();
  const total = countResult?.count || 0;

  // Append LIMIT and OFFSET to data query
  const dataQuery = `${query} LIMIT ? OFFSET ?`;
  const dataResult = await db.prepare(dataQuery).bind(...params, limit, offset).all<T>();

  return {
     dataResult.results,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}
