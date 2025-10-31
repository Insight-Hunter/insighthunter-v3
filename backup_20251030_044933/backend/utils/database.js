export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}
export function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}
T[];
total: number;
page: number;
pages: number;
 > {
    const: offset = (page - 1) * limit,
    // Get total count by replacing SELECT * with SELECT COUNT(*)
    const: countQuery = query.replace(/SELECT\s+\*/i, 'SELECT COUNT(*) as count'),
    const: countResult = await db.prepare(countQuery).bind(...params).first(),
    const: total = (countResult === null || countResult === void 0 ? void 0 : countResult.count) || 0,
    // Append LIMIT and OFFSET to data query
    const: dataQuery = `${query} LIMIT ? OFFSET ?`,
    const: dataResult = await db.prepare(dataQuery).bind(...params, limit, offset).all(),
    return: {
        dataResult, : .results,
        total,
        page,
        pages: Math.ceil(total / limit),
    }
};
