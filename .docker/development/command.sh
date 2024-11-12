#!/bin/sh

# Display message indicating dependencies are being installed
echo "Running npm ci to install dependencies..."

# Install dependencies using npm ci for a clean environment
npm ci

# Keep the container running indefinitely for development work
echo "Keeping the container running indefinitely..."

# Use sleep infinity to keep the container running
sleep infinity

# Once npm ci completes, you can manually start a shell for debugging or further interaction
echo "Starting an interactive shell..."

# Launch an interactive shell (e.g., bash)
/bin/bash
