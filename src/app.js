/**
 * @file src/app.js
 * @description Data Collector 
 */

const {
  logger,
  events,
  eventHub,
  listenDataCollectRequest,
  listenMessage
} = require('@auto-content-labs/messaging');
const { eventDataCollectRequest } = require("./events/eventDataCollectRequest");

global.tasksProcessed = 0;
global.startTime = null;

// Start the listener for data collection requests
async function start() {
  try {
    logger.info("Application starting...");

    // Start time for overall processing
    global.startTime = Date.now();

    // The event we will listen to.
    const eventName = events.dataCollectRequest;

    // Listen to incoming data collection requests
    await listenMessage(eventName, eventDataCollectRequest);

    logger.info(`Listener started on event: ${eventName}`);

  } catch (error) {
    logger.error(`Application failed to start:${eventName}`, error);
  }
}

/**
 * Graceful shutdown handler for the application.
 */
function handleShutdown() {
  logger.info("Application shutting down...");
  process.exit(0);
}

// Listen for process signals for graceful shutdown
process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

// Start the application
start();
