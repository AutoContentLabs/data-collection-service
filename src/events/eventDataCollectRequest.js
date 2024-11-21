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
  sendDataCollectErrorRequest,
  fileWriter
} = require('@auto-content-labs/messaging');
const { fetchDataAndParse } = require('../helpers/fetchHandler');


/**
 * Saves the source log to a separate log file.
 * @param {string} filePath - Path to the log file.
 * @param {string} logData - Log data to be written.
 * @param {boolean} append - Whether to append to the file or overwrite it.
 */
async function saveSourceLog(filePath, logData, append = false) {
  try {
    await fileWriter(filePath, logData, append);
    logger.info(`Source info saved to: ${filePath}`);
  } catch (error) {
    logger.error(`Error saving source log: ${error.message}`, { error });
    throw error; // Re-throw the error to be handled in the main function
  }
}

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
      const id = helper.getCurrentTimestamp()

      // Save source information to a separate log file
      const sourceFile = `sources.csv`;
      const sourceLog = `${id}, ${url}, ${format}, ${fetchStartTime}, ${fetchEndTime}, ${processingDuration}\n`;
      await saveSourceLog(path.join(__dirname, '../../files/logs', sourceFile), sourceLog, true);

      // await sendDataCollectResponseRequest({
      //   id: helper.getCurrentTimestamp(),
      //   data: parsedData,
      //   timestamp: helper.getCurrentTimestamp(),
      //   summary: {
      //     source: url,
      //     itemCount: parsedData.length || 1, // Ensure itemCount is always a valid number
      //     dataFormat: format, // Dynamically set dataFormat
      //     processingTime: processingDuration
      //   }
      // });

      // await sendDataCollectStatusRequest({
      //   id: helper.getCurrentTimestamp(),
      //   status: "completed",
      //   message: "Data collection is completed successfully.",
      //   timestamp: helper.getCurrentTimestamp(),
      // });
      logger.notice(`[eventDataCollectRequest] completed ${url}`)
    } catch (error) {
      const errorMessage = `[eventDataCollectRequest] ${url} ${error}`
      logger.error(errorMessage)
      // throw new Error(errorMessage);


      // await sendLogRequest({
      //   logId: helper.getCurrentTimestamp(),
      //   message: `${errorCodes.DATA_FETCH_ERROR.message}: ${error.message}`,
      //   level: "error",
      //   timestamp: helper.getCurrentTimestamp(),
      // });

      // await sendDataCollectErrorRequest({
      //   id: helper.getCurrentTimestamp(),
      //   errorCode: errorCodes.DATA_FETCH_ERROR.code,
      //   errorMessage: `${error.message}`,
      //   timestamp: helper.getCurrentTimestamp(),
      // });

      // await sendDataCollectStatusRequest({
      //   id: helper.getCurrentTimestamp(),
      //   status: "failed",
      //   message: "Data collection has failed.",
      //   timestamp: helper.getCurrentTimestamp(),
      // });
    }
  } else {
    // const invalidMessageError = errorCodes.INVALID_MESSAGE_FORMAT.message;
    // await sendLogRequest({
    //   logId: helper.getCurrentTimestamp(),
    //   message: invalidMessageError,
    //   level: "error",
    //   timestamp: helper.getCurrentTimestamp(),
    // });
  }
}


module.exports = { eventDataCollectRequest };
