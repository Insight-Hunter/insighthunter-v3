export class UserSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sqlite = state.storage.sqlite;
    this.userId = null;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.endsWith("/init")) {
      return this.handleInit(request);
    } else if (path.endsWith("/upload")) {
      return this.handleUpload(request);
    } else if (path.endsWith("/forecast")) {
      return this.handleForecast(request);
    } else {
      return new Response("Not Found", { status: 404 });
    }
  }

  async handleInit(request) {
    const data = await request.json();
    this.userId = data.userId;
    await this.state.storage.put("userId", this.userId);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  async handleUpload(request) {
    if (!this.userId) {
      this.userId = await this.state.storage.get("userId");
    }
    if (!this.userId) {
      return new Response("User ID not initialized", { status: 400 });
    }

    const body = await request.json();
    const transactions = body.transactions;

    await this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS staging_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        amount REAL,
        category TEXT
      )
    `);

    const insertStmt = await this.sqlite.prepare(
      `INSERT INTO staging_transactions (date, amount, category) VALUES (?, ?, ?)`
    );

    for (const tx of transactions) {
      await insertStmt.bind(tx.date, tx.amount, tx.category).run();
    }

    await insertStmt.finalize();

    const allTx = await this.sqlite.all(`SELECT * FROM staging_transactions`);
    const d1Db = this.env.INSIGHT_HUNTER_DB;

    for (const row of allTx) {
      await d1Db
        .prepare(
          `INSERT INTO transactions (user_id, date, amount, category) VALUES (?, ?, ?, ?)`
        )
        .bind(this.userId, row.date, row.amount, row.category)
        .run();
    }

    await this.sqlite.exec(`DELETE FROM staging_transactions`);

    return new Response(JSON.stringify({ imported: allTx.length }), {
      status: 200,
    });
  }

  async handleForecast(request) {
    if (!this.userId) {
      this.userId = await this.state.storage.get("userId");
    }
    if (!this.userId) {
      return new Response("User ID not initialized", { status: 400 });
    }

    const d1Db = this.env.INSIGHT_HUNTER_DB;

    const rows = await d1Db
      .prepare(
        `SELECT date, SUM(amount) as total_amount FROM transactions 
         WHERE user_id = ? 
         GROUP BY date ORDER BY date`
      )
      .bind(this.userId)
      .all();

    let cumulative = 0;
    const forecast = rows.results.map((r) => {
      cumulative += r.total_amount;
      return { date: r.date, cumulativeAmount: cumulative };
    });

    return new Response(JSON.stringify({ forecast }), { status: 200 });
  }
}
