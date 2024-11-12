# Use Microsoft's official development container image for Node.js
ARG BASE_IMAGE="mcr.microsoft.com/devcontainers/javascript-node:22"

# Base stage from the image
FROM $BASE_IMAGE AS base

# Set the working directory inside the container
WORKDIR /workspaces/app

# Copy package.json and package-lock.json files to install dependencies
COPY package*.json ./

# Install dependencies using npm ci (more reliable and faster)
RUN npm ci

# Copy all application files into the container
COPY . .

# Create a non-root user to run the application for security
RUN if [ -f /etc/alpine-release ]; then \
  adduser -D app_user; \
  elif [ -f /etc/debian_version ]; then \
  adduser --disabled-password --gecos "" app_user; \
  else \
  useradd -m -s /bin/bash app_user; \
  fi

USER app_user

# Expose the port (optional, but could be useful for integration testing)
EXPOSE 3000
