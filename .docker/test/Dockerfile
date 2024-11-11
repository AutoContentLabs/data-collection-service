# Default images
ARG BASE_IMAGE="ubuntu:22.04"

# Base stage
FROM $BASE_IMAGE AS base

# Install base packages
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# If you are registered, you will remain at the root of the work environment.
WORKDIR /workspaces/app

# Copy only necessary files
COPY . .

# It allows the application to start automatically.
# CMD ["/bin/bash", "-c", ".docker/command.sh"]