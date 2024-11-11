# Dockerfile

# Use a lighter Alpine image
FROM node:22-alpine

# Create the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies (npm ci is more reliable and faster)
RUN npm ci

# Copy application files
COPY . .

# For security, run the application with the 'app_user' user
RUN adduser -D app_user
USER app_user

# Start the application
CMD ["npm", "start"]