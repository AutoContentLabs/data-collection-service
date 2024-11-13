# Default images
ARG BASE_IMAGE="mcr.microsoft.com/devcontainers/javascript-node:22"

# Base stage
FROM $BASE_IMAGE AS base

# Set the working directory
WORKDIR /workspaces/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies (npm ci is more reliable and faster)
RUN npm ci

# Copy application files
COPY . .

# For security, run the application with the 'app_user' user
RUN if [ -f /etc/alpine-release ]; then \
  adduser -D app_user; \
  elif [ -f /etc/debian_version ]; then \
  adduser --disabled-password --gecos "" app_user; \
  else \
  useradd -m -s /bin/bash app_user; \
  fi

# Set permissions for the entire app directory to 'app_user'
RUN chown -R app_user:app_user /workspaces/app

USER app_user

# Expose the port your application runs on
EXPOSE 3000
