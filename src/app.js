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
const { eventDataCollectRequest } = require("./events/eventDataCollectRequest")

// Start the listener for data collection requests
async function start() {
  try {
    logger.info("Application starting...");

    // The event we will listen to.
    const eventName = events.dataCollectRequest

    // This method adds events to the event center.
    // In case of a transaction error, the data is not read again.
    // await listenDataCollectRequest()
    await listenMessage(eventName, eventDataCollectRequest)

    // events   
    // If we use this method, if there is a problem in processing the data after receiving it,
    // we cannot get the same information again.
    // eventHub.on(eventName, eventDataCollectRequest)

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
  // Add any necessary cleanup code here (e.g., close DB connections, stop listeners)
  process.exit(0);
}

// Listen for process signals for graceful shutdown
process.on("SIGINT", handleShutdown); // for Ctrl+C in terminal
process.on("SIGTERM", handleShutdown); // for termination signal

// Start the application
start();
