/**
 * src\events\eventDataCollectRequest.js
 */

const logger = require('@auto-content-labs/messaging/src/utils/logger');
const { sendLogRequest, sendDataCollectResponseRequest, sendDataCollectStatusRequest, sendDataCollectErrorRequest } = require('@auto-content-labs/messaging');
const { fetchDataAndParse } = require('../helpers/fetchHandler');
const { getCurrentTimestamp } = require('../helpers/timestamp');
const errorCodes = require('../constants/errorCodes');

/**
 * Handles data collection request events.
 * @param {Object} processedData - The processedData data source.
 * @param {Object} processedData.key - The key in the data pair (optional).
 * @param {Object} processedData.value - The incoming model data
 * @param {Object} processedData.value.id
 * @param {Object} processedData.value.source
 * @param {Object} processedData.value.params
 * @param {Object} processedData.value.priority
 * @param {Object} processedData.value.timestamp
 * @param {number} processedData.timestamp - Timestamp of the message.
 * @param {number} processedData.headers - Headers of the message.
 */
async function eventDataCollectRequest({ value } = processedData) {
  if (!value) {
    logger.error("No value found in the message");
    return;
  }

  // Validate message format
  if (value.params && value.params.url) {
    const url = value.params.url;

    // await sendLogRequest({
    //   logId: getCurrentTimestamp(),
    //   message: `Data processing start: ${url}`,
    //   level: "info",
    //   timestamp: getCurrentTimestamp(),
    // });

    try {
      // Fetch and parse data
      const resultObject = await fetchDataAndParse(url);

      await sendDataCollectResponseRequest({
        id: getCurrentTimestamp(),
        data: resultObject,
        timestamp: getCurrentTimestamp(),
      });

      // await sendDataCollectStatusRequest({
      //   id: getCurrentTimestamp(),
      //   status: "completed",
      //   message: "Data collection is completed.",
      //   timestamp: getCurrentTimestamp(),
      // });
    } catch (error) {
      const errorMessage = errorCodes.DATA_FETCH_ERROR.message;
      await sendLogRequest({
        logId: getCurrentTimestamp(),
        message: `${errorMessage}: ${error.message}`,
        level: "error",
        timestamp: getCurrentTimestamp(),
      });

      await sendDataCollectErrorRequest({
        id: getCurrentTimestamp(),
        errorCode: errorCodes.DATA_FETCH_ERROR.code,
        errorMessage: `${errorMessage}: ${error.message}`,
        timestamp: getCurrentTimestamp(),
      });

      // await sendDataCollectStatusRequest({
      //   id: getCurrentTimestamp(),
      //   status: "failed",
      //   message: "Data collection has failed.",
      //   timestamp: getCurrentTimestamp(),
      // });
    }
  } else {
    const invalidMessageError = errorCodes.INVALID_MESSAGE_FORMAT.message;
    await sendLogRequest({
      logId: getCurrentTimestamp(),
      message: invalidMessageError,
      level: "error",
      timestamp: getCurrentTimestamp(),
    });
  }
}

module.exports = { eventDataCollectRequest };
