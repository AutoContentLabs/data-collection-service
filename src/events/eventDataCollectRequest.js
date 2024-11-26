const path = require("path");
const {
  logger,
  helper,
  fileWriter,
  sendDataCollectResponseRequest,
  sendDataCollectStatusRequest,
  sendDataCollectErrorRequest
} = require("@auto-content-labs/messaging");
const { fetchDataAndParse } = require("../helpers/fetchHandler");
const { calculateProgress } = require("../helpers/progress");

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
 * @param {Object} processedData - The processed data source object.
 * @param {Object} processedData.value - The incoming model data.
 * @param {Object} processedData.headers - The request headers.
 * @param {string} processedData.value.url - The URL to fetch data from.
 * @param {string} processedData.value.id - The unique task identifier.
 * @param {Object} processedData.headers.correlationId - The correlation ID for tracking.
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

  // Get the number of Kafka partitions from environment variables, defaulting to 1
  const partitions = parseInt(process.env.KAFKA_NUM_PARTITIONS, 10) || 1;
  // Calculate the total number of tasks, ensuring it defaults to 1 if zero
  const total = Math.max(value.total / partitions, 1);

  const id = value.id;
  const url = value.params.url;
  const fetchStartTime = Date.now();

  try {
    const { parsedData, format } = await fetchDataAndParse(url);

    const fetchEndTime = Date.now();
    const processingDuration = fetchEndTime - fetchStartTime;

    const sourceFile = "sources.csv";
    const sourceLog = `${id},${url},${format},${fetchStartTime},${fetchEndTime},${processingDuration}\n`;
    const logPath = path.join(__dirname, "../../files/logs", sourceFile);

    await saveSourceLog(logPath, sourceLog, true);

    // Increment the task processed counter
    global.tasksProcessed++;

    // If totalTasks is 0, set it to 1 (to avoid division by zero)
    let totalTasks = total || 1;

    // Calculate progress and estimate remaining time using the helper function
    const { progressPercentage, formattedElapsedTime, formattedEstimatedTimeRemaining } = calculateProgress(
      global.tasksProcessed,
      totalTasks,
      global.startTime
    );

    // Log the progress
    logger.notice(`[dcs] [${id}] ${headers.correlationId.toString()} url: ${url}`);
    if (global.tasksProcessed % 10 === 0 || global.tasksProcessed === totalTasks) {
      logger.notice(`[dcs] [✨] [${progressPercentage}%] [${formattedElapsedTime}] [${formattedEstimatedTimeRemaining}]`);
    }

    await sendDataCollectResponseRequest({
      id,
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
      id,
      status: "completed",
      message: "Data collection is completed successfully.",
      timestamp: helper.getCurrentTimestamp(),
    });


  } catch (error) {
    if (error instanceof Error) {
      logger.error(`[dcs] [${id}] ${headers.correlationId.toString()} url: ${url} - ${error.name}`);
    } else {
      logger.error(`[dcs] [${id}] ${headers.correlationId.toString()} url: ${url} - ${typeof error}`);
    }

    await sendDataCollectErrorRequest({
      id,
      errorCode: errorCodes.DATA_FETCH_ERROR.code,
      errorMessage: `${error.message}`,
      timestamp: helper.getCurrentTimestamp(),
    });

    await sendDataCollectStatusRequest({
      id,
      status: "failed",
      message: "Data collection has failed.",
      timestamp: helper.getCurrentTimestamp(),
    });


    throw error;
  }
}

module.exports = { eventDataCollectRequest };
