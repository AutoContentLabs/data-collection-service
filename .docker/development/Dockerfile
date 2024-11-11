# Default images
ARG BASE_IMAGE="mcr.microsoft.com/devcontainers/javascript-node:22"

# Base stage
FROM $BASE_IMAGE AS base

# If you are registered, you will remain at the root of the work environment.
WORKDIR /workspaces/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies (npm ci is more reliable and faster)
RUN npm ci

# Copy application files
COPY . .

# For security, run the application with the 'app_user' user
# RUN adduser -D app_user
# USER app_user

# It allows the application to start automatically.
# CMD ["/bin/bash", "-c", ".docker/command.sh"]