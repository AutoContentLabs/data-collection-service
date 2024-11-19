/**
 * @file src/app.js
 * @description Data Collector 
 */

const logger = require("./utils/logger");
const { topics, listenMessage } = require('@auto-content-labs/messaging');
const { onMessage } = require("./messageHandler");

async function start() {
  try {
    logger.info("Application starting...");

    // Check for required configurations
    if (!topics.dataCollectRequest) {
      throw new Error("Topic 'dataCollectRequest' is not defined in topics.");
    }

    // Start the listener for data collection requests
    listenMessage(topics.dataCollectRequest, onMessage);
    logger.info(`Listener started on topic: ${topics.dataCollectRequest}`);

  } catch (error) {
    logger.error("Application failed to start:", error);
    // Optionally retry logic can be added here, or set up an alert if critical
  }
}

/**
 * Graceful shutdown handler for the application.
 */
function handleShutdown() {
  logger.info("Application shutting down...");
  // Add any necessary cleanup code here (e.g., close DB connections, stop listeners)
  process.exit(0);
}

// Listen for process signals for graceful shutdown
process.on("SIGINT", handleShutdown); // for Ctrl+C in terminal
process.on("SIGTERM", handleShutdown); // for termination signal

// Start the application
start();
