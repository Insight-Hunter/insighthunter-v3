```dockerfile
# .devcontainer/Dockerfile
# Custom Dockerfile for Insight Hunter development environment
# Only needed if you want more customization than the base image provides

FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# Install additional system packages if needed
# For example, if you need certain build tools or utilities
RUN apt-get update && apt-get install -y \
    sqlite3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages that you want available everywhere
RUN npm install -g \
    wrangler \
    npm-check-updates

# Set up shell aliases and environment for better developer experience
RUN echo 'alias ll="ls -lah"' >> /home/node/.bashrc \
    && echo 'alias gs="git status"' >> /home/node/.bashrc \
    && echo 'alias gp="git pull"' >> /home/node/.bashrc

# The base image already has node and npm, we're just adding extras here
