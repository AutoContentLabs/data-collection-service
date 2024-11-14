const logger = require("./utils/logger");
const { logSender, dataCollectResponseSender, dataCollectStatusSender, dataCollectErrorSender } = require('@auto-content-labs/messaging');
const { fetcher, formatURL } = require("@auto-content-labs/fetcher");

/**
 * Incoming message processing function
 * 
 * @param {Object} message - Incoming message
 */
async function onMessage({ topic, partition, message }) {
  const key = message.key ? message.key.toString() : null;
  const timestamp = message.timestamp;

  // Parsing message value only if exists to avoid unnecessary operations
  let value;
  try {
    value = message.value ? JSON.parse(message.value.toString()) : null;
  } catch (error) {
    logger.error("Failed to parse message value as JSON.", error);
    return;
  }

  // send log
  logger.info(`Received: [${topic}] [${partition}] [${key}] [${timestamp}]`);

  if (!value) {
    logger.error("No value found in the message");
    return;
  }

  // Check message format
  if (value.taskId && value.source && value.parameters && value.parameters.url) {
    let url = value.parameters.url;

    // Format the URL before making a request using the fetcher utility
    url = formatURL(url); // Ensures the URL has a proper schema (https://)

    logSender.sendLog(value.taskId, 'info', `Data collection started for URL: ${url}`);

    try {
      // Fetch data using the fetcher utility with timeout and retry logic
      const data = await fetcher(url);

      if (data) {
        // Send data collect response and log
        dataCollectResponseSender.sendDataCollectResponse(value.taskId, data);
        logSender.sendLog(value.taskId, 'info', `Data collection completed successfully.`);

        // Update status
        dataCollectStatusSender.sendDataCollectStatus(value.taskId, 'completed', 'Data collection completed.');
      } else {
        throw new Error('Data fetch failed or returned empty data');
      }
    } catch (error) {
      // Critical error log with alert and send error
      logSender.sendLog(value.taskId, 'error', `Error occurred: ${error.message}`);
      logger.error(`Error during data collection for taskId ${value.taskId}: ${error.message}`);

      dataCollectErrorSender.sendDataCollectError(value.taskId, 'DATA_FETCH_ERROR', `Failed to fetch data from URL: ${url}. Error: ${error.message}`);
      dataCollectStatusSender.sendDataCollectStatus(value.taskId, 'failed', 'Data collection failed.');

      // Optional retry logic can be added here if necessary
    }
  } else {
    logger.error("Invalid message format, missing necessary fields: taskId, source, or parameters.");
    logSender.sendLog(value.taskId || 'unknown', 'error', `Invalid message format, missing necessary fields.`);
  }
}

module.exports = { onMessage };
