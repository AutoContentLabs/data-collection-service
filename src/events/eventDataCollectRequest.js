const path = require("path");
const {
  logger,
  helper,
  fileWriter,
  progress,
  handleDataCollectRequest,
  sendDataCollectResponseRequest,
  sendDataCollectStatusRequest,
  sendDataCollectErrorRequest
} = require("@auto-content-labs/messaging");
const { fetchDataAndParse } = require("../helpers/fetchHandler");

/**
 * Saves the source log to the specified file.
 * @param {string} filePath - The path of the log file.
 * @param {string} logData - The log data to save.
 * @param {boolean} append - Whether to append to the file or overwrite.
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
 * @param {Object} pair - The processed data source object.
 * @param {Object} pair.value - The incoming model data.
 * @param {Object} pair.headers - The request headers.
 * @param {string} pair.value.url - The URL to fetch data from.
 * @param {string} pair.value.id - The unique task identifier.
 * @param {Object} pair.headers.correlationId - The correlation ID for tracking.
 */
async function eventDataCollectRequest(pair) {
  const { key, value, headers } = pair
  if (!value) {
    logger.error("No value found in the message");
    return;
  }

  const model = await handleDataCollectRequest({ key, value, headers });

  const partitions = parseInt(process.env.KAFKA_NUM_PARTITIONS, 10) || 1;
  const total = Math.max(1 / partitions, 1);
  const id = model.id;
  const url = model.service.parameters.url;

  // Start performance measurement
  const fetchStartTime = new Date();

  try {
    const { parsedData, format } = await fetchDataAndParse(url);

    // End performance measurement
    const fetchEndTime = new Date();
    const processingDuration = fetchEndTime - fetchStartTime;

    const sourceFile = "sources.csv";
    const sourceLog = `${id},${url},${format},${new Date(fetchStartTime).toISOString()},${new Date(fetchEndTime).toISOString()},${processingDuration}\n`;
    const logPath = path.join(__dirname, "../../files/sources", sourceFile);

    // Save the log with appended data
    await saveSourceLog(logPath, sourceLog, true);

    // Global task
    global.tasksProcessed++;
    let totalTasks = total || 1;

    // Calculate progress and log periodically
    const { progressPercentage, formattedElapsedTime, formattedEstimatedTimeRemaining } = progress.calculateProgress(
      global.tasksProcessed,
      totalTasks,
      global.startTime
    );

    logger.notice(`[dcs] [${id}] ${headers.correlationId} url: ${url}`);
    if (global.tasksProcessed % 10 === 0 || global.tasksProcessed === totalTasks) {
      // The actual calculation is not correct!
      // we need to fix
      // logger.notice(`[dcs] [✨] [${progressPercentage}%] [${formattedElapsedTime}] [${formattedEstimatedTimeRemaining}]`);
    }

    // Prepare measurement data
    const measurementTime = helper.getCurrentTimestamp();
    model.service.measurements = {
      service_id: model.service.service_id,
      metric_id: 0,
      measurement_time: measurementTime,
      measurement_start_time: fetchStartTime.toISOString(),
      measurement_end_time: fetchEndTime.toISOString(),
      metric_type: "performance",
      metric_value: processingDuration
    };

    const content = {
      content_type: format,
      content_length: parsedData.length || 1,
      data: [parsedData]
    };


    const response = {
      id: model.id,
      service: model.service,
      content: content
    };

    // Send the data collection request   
    const providedHeaders = { correlationId: headers.correlationId, traceId: headers.traceId } // track before request
    // Send the successful response
    await sendDataCollectResponseRequest({ value: response, headers: providedHeaders });

    // // Send status update indicating completion
    // await sendDataCollectStatusRequest({
    //   value: {
    //     id,
    //     status: "completed",
    //     message: "Data collection is completed successfully.",
    //     timestamp: helper.getCurrentTimestamp(),
    //   },
    //   headers
    // });
  } catch (error) {
    // Handle errors and send failure response
    const errorMessage = error instanceof Error ? error.message : `${error}`;

    logger.error(`[dcs] [${id}] ${headers.correlationId} url: ${url} - ${error.name || "Unknown Error"}`, error);
    // Send the data collection request   
    const providedHeaders = { correlationId: headers.correlationId, traceId: headers.traceId } // track before request
    // await sendDataCollectErrorRequest({
    //   value: {
    //     id,
    //     errorCode: errorCodes.DATA_FETCH_ERROR.code,
    //     errorMessage: errorMessage,
    //     timestamp: helper.getCurrentTimestamp(),
    //   },
    //   headers
    // });

    // await sendDataCollectStatusRequest({
    //   value: {
    //     id,
    //     status: "failed",
    //     message: "Data collection has failed.",
    //     timestamp: helper.getCurrentTimestamp(),
    //   },
    //   headers
    // });

    throw error; // Error message sent for re-reading.
  }

}

module.exports = { eventDataCollectRequest };
