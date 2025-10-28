// TODO: Implement analytics worker
export default {
  async fetch(request, env) {
    return new Response('Analytics Worker', { status: 200 });
  }
};
