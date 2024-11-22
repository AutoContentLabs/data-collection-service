const path = require("path");
const {
  logger,
  helper,
  fileWriter,
} = require("@auto-content-labs/messaging");
const { fetchDataAndParse } = require("../helpers/fetchHandler");

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
    throw new Error("Failed to save source log");
  }
}

/**
 * Handles data collection request events.
 * @param {Object} processedData - The processedData data source.
 * @param {Object} processedData.value - The incoming model data.
 */
async function eventDataCollectRequest({ value, headers } = {}) {
  if (!value) {
    logger.error("No value found in the message");
    return;
  }

  if (!value.params || !value.params.url) {
    logger.error("URL parameter is missing");
    return;
  }
  const id = value.id
  const url = value.params.url;
  const fetchStartTime = Date.now();

  try {
    // Fetch and parse the data
    const { parsedData, format } = await fetchDataAndParse(url);

    const fetchEndTime = Date.now();
    const processingDuration = fetchEndTime - fetchStartTime;

    // Save source log
    const sourceFile = "sources.csv";
    const sourceLog = `${id},${url},${format},${fetchStartTime},${fetchEndTime},${processingDuration}\n`;
    const logPath = path.join(__dirname, "../../files/logs", sourceFile);

    await saveSourceLog(logPath, sourceLog, true);

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

    logger.notice(`[dcs] [${id}] correlationId ${headers.correlationId.toString()} url: ${url}`);
  } catch (error) {

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

    if (error instanceof Error) {
      logger.error(`[dcs] [${id}] correlationId ${headers.correlationId.toString()} url: ${url} - ${error.name}`);
    } else {
      logger.error(`[dcs] [${id}] correlationId ${headers.correlationId.toString()} url: ${url} - ${typeof error}`);
    }
    throw error; // Rethrow for external error handling
  }
}

module.exports = { eventDataCollectRequest };
