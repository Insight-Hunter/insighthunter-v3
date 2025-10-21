export class UserSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
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
    }

    return new Response("Not Found", { status: 404 });
  }

  async handleInit(request) {
    const data = await request.json();
    await this.state.storage.put("userId", data.userId);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  async handleUpload(request) {
    const userId = await this.state.storage.get("userId");
    if (!userId) return new Response("User ID not initialized", { status: 400 });

    const { transactions } = await request.json();

    await this.state.storage.put("transactions", transactions);

    // Example: batch persist to D1 here if needed

    return new Response(JSON.stringify({ imported: transactions.length }), { status: 200 });
  }

  async handleForecast(request) {
    const userId = await this.state.storage.get("userId");
    if (!userId) return new Response("User ID not initialized", { status: 400 });

    // Dummy forecast data example
    const forecast = [{ date: "2025-01-01", value: 1000 }, { date: "2025-02-01", value: 1200 }];

    return new Response(JSON.stringify({ forecast }), { status: 200 });
  }
}
