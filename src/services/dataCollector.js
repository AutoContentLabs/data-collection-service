/**
 * @file src/services/dataCollector.js
 * @description Data Collector 
 */

const { logger } = require('@auto-content-labs/messaging-utils');

const {
  events,
  listenMessage
} = require('@auto-content-labs/messaging');

const { eventDataCollectRequest } = require("../events/eventDataCollectRequest");

const async = require('async');
// Get the concurrent parallel limit from the environment variable, default to 5 if not set
const MAX_PARALLEL_TASKS = parseInt(process.env.MAX_PARALLEL_TASKS) || 5;

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

    // // Queue with a concurrency limit (5 parallel tasks)
    // const queue = async.queue(async (message, callback) => {
    //   try {
    //     await eventDataCollectRequest(message); // Process the event
    //   } catch (error) {
    //     logger.error("Error processing event", error);
    //   } finally {
    //     callback(); // Ensure the queue progresses
    //   }
    // }, MAX_PARALLEL_TASKS); // Limit to 5 concurrent tasks

    // // Listen to incoming data collection requests
    // await listenMessage(eventName, (message) => {
    //   queue.push(message); // Add message to the queue for processing
    // });

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

module.exports = { start };
