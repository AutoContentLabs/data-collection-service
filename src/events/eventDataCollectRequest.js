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

    const fetchStartTime = Date.now();

    try {
      const resultObject = await fetchDataAndParse(url);
      const { parsedData, format } = resultObject; // Destructure to get parsed data and format

      const fetchEndTime = Date.now();
      const processingDuration = fetchEndTime - fetchStartTime;

      await sendDataCollectResponseRequest({
        id: helper.getCurrentTimestamp(),
        data: parsedData,
        timestamp: helper.getCurrentTimestamp(),
        summary: {
          source: url,
          itemCount: parsedData.length || 1, // Ensure itemCount is always a valid number
          dataFormat: format, // Dynamically set dataFormat
          processingTime: processingDuration
        }
      });

      await sendDataCollectStatusRequest({
        id: helper.getCurrentTimestamp(),
        status: "completed",
        message: "Data collection is completed successfully.",
        timestamp: helper.getCurrentTimestamp(),
      });

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
        errorMessage: `${error.message}`,
        timestamp: helper.getCurrentTimestamp(),
      });

      await sendDataCollectStatusRequest({
        id: helper.getCurrentTimestamp(),
        status: "failed",
        message: "Data collection has failed.",
        timestamp: helper.getCurrentTimestamp(),
      });
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
