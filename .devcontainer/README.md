# .devcontainer/README.md

## Development Container Setup

This project includes a development container configuration that provides a consistent development environment for all contributors.

### Prerequisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [Visual Studio Code](https://code.visualstudio.com/)
3. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) in VS Code

### Getting Started

1. Clone the repository
2. Open the repository folder in VS Code
3. When prompted, click "Reopen in Container"
4. Wait for the container to build and dependencies to install (first time only, takes 5-10 minutes)
5. You're ready to develop!

### What's Included

- Node.js 20 LTS
- All project dependencies pre-installed
- Wrangler CLI for Cloudflare Workers
- Useful VS Code extensions for JavaScript, React, and Cloudflare development
- Pre-configured linting and formatting
- Port forwarding for local development

### Running the Application

From the integrated terminal in VS Code:

```bash
# Run the frontend
cd frontend
npm run dev

# Run a Worker locally (in a separate terminal)
cd workers/auth
npx wrangler dev

# Deploy a Worker to Cloudflare
cd workers/auth
npx wrangler deploy
