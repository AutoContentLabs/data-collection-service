const logger = require("./utils/logger");
const { sendMessage, sendLog, topics, sendDataCollectResponse, sendDataCollectStatus, sendDataCollectError } = require('@auto-content-labs/messaging');
const { fetchData } = require("@auto-content-labs/fetcher")
/**
 * Incoming message processing function
 * 
 * @param {Object} message - Incoming message
 */
async function onMessage({ topic, partition, message }) {
  const key = message.key ? message.key.toString() : null;
  const timestamp = message.timestamp;
  const value = message.value ? JSON.parse(message.value.toString()) : null;

  // send log
  logger.info(`Received: [${topic}] [${partition}] [${key}] [${timestamp}] `);

  if (!value) {
    logger.error("No value found in the message");
    return;
  }

  // check
  if (value.taskId && value.source && value.parameters && value.parameters.url) {

    const url = value.parameters.url;

    // Send log message (Started)
    sendLog(value.taskId, 'info', `Data collection started for URL: ${url}`);

    try {

      const data = await fetchData(url);

      // Success
      if (data) {

        sendDataCollectResponse(value.taskId, data)

        sendLog(value.taskId, 'info', `Data collection completed successfully.`);

        // Update status
        sendDataCollectStatus(value.taskId, 'completed', 'Data collection completed.')

      } else {
        throw new Error('Data fetch failed or returned empty data');
      }
    } catch (error) {

      // Error status
      sendAlert(value.taskId, error); // Send critical alert

      logger.error(`Error during data collection: ${error.message}`);

      // send error message
      sendDataCollectError(value.taskId, 'DATA_FETCH_ERROR', `Failed to fetch data from URL: ${url}. Error: ${error.message}`)
      sendLog(value.taskId, 'error', `Error occurred: ${error.message}`);

      // Update status
      sendDataCollectStatus(value.taskId, 'failed', 'Data collection failed.')
    }
  } else {
    sendLog(value.taskId, 'error', `Invalid message format, missing necessary fields.`);
    logger.error("Invalid message format, missing necessary fields.");
  }
}

module.exports = { onMessage };
