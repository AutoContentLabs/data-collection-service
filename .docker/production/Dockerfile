# Default images
ARG BASE_IMAGE="node:22-alpine"

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

# Start the application
CMD ["npm", "start"]