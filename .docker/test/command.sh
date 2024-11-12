#!/bin/sh

# Display message indicating dependencies are being installed
echo "Running npm ci to install dependencies..."

# Install dependencies using npm ci for a clean environment
npm ci

# Run tests using your test framework (e.g., Mocha, Jest, etc.)
echo "Running tests..."

# Run tests (replace with your actual test command)
npm test

# If tests are successful, keep the container running (useful for further investigation or integration testing)
echo "Tests completed. Keeping container running for further inspection..."

# Use sleep infinity to keep the container running
sleep infinity

# Once tests are finished, you can manually start a shell for debugging or further interaction
echo "Starting an interactive shell..."

# Launch an interactive shell (e.g., bash) for debugging
/bin/bash
