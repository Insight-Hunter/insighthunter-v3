import sqlite3 from "sqlite3";
import { open } from "sqlite";

let dbPromise = open({
  filename: "./database.sqlite",
  driver: sqlite3.Database,
});

export async function query(sql: string, params: any[] = []) {
  const db = await dbPromise;
  if (sql.trim().toLowerCase().startsWith("select")) {
    return db.all(sql, params);
  } else {
    const result = await db.run(sql, params);
    return { lastID: result.lastID, changes: result.changes };
  }
}
