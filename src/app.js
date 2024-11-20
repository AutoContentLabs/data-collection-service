/**
 * @file src/app.js
 * @description Data Collector 
 */

const {
  logger,
  events,
  eventHub,
  listenDataCollectRequest
} = require('@auto-content-labs/messaging');
const { eventDataCollectRequest } = require("./events/eventDataCollectRequest")

async function start() {
  try {
    logger.info("Application starting...");

    // Start the listener for data collection requests
    await listenDataCollectRequest()
    const eventName = events.dataCollectRequest
    logger.info(`Listener started on event: ${eventName}`);

    // events   
    eventHub.on(eventName, eventDataCollectRequest)

  } catch (error) {
    logger.error(`Application failed to start:${eventName}`, error);

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
