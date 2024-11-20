/**
 * src\events\eventDataCollectRequest.js
 */

const {
  logger,
  helper,
  errorCodes,
  sendDataCollectResponseRequest,
  sendLogRequest,
  sendDataCollectStatusRequest,
  sendDataCollectErrorRequest
} = require('@auto-content-labs/messaging');
const { fetchDataAndParse } = require('../helpers/fetchHandler');

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
        id: helper.getCurrentTimestamp(),
        data: resultObject,
        timestamp: helper.getCurrentTimestamp(),
      });

      // await sendDataCollectStatusRequest({
      //   id: helper.getCurrentTimestamp(),
      //   status: "completed",
      //   message: "Data collection is completed.",
      //   timestamp: helper.getCurrentTimestamp(),
      // });
    } catch (error) {

      await sendLogRequest({
        logId: helper.getCurrentTimestamp(),
        message: `${errorCodes.DATA_FETCH_ERROR.message}: ${error.message}`,
        level: "error",
        timestamp: helper.getCurrentTimestamp(),
      });

      await sendDataCollectErrorRequest({
        id: helper.getCurrentTimestamp(),
        errorCode: errorCodes.DATA_FETCH_ERROR.code,
        errorMessage: `${errorMessage}: ${error.message}`,
        timestamp: helper.getCurrentTimestamp(),
      });

      // await sendDataCollectStatusRequest({
      //   id: helper.getCurrentTimestamp(),
      //   status: "failed",
      //   message: "Data collection has failed.",
      //   timestamp: helper.getCurrentTimestamp(),
      // });
    }
  } else {
    const invalidMessageError = errorCodes.INVALID_MESSAGE_FORMAT.message;
    await sendLogRequest({
      logId: helper.getCurrentTimestamp(),
      message: invalidMessageError,
      level: "error",
      timestamp: helper.getCurrentTimestamp(),
    });
  }
}

module.exports = { eventDataCollectRequest };
