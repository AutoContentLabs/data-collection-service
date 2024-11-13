/**
 * @file src/app.js
 * @description Data Collector 
 */

const logger = require("./utils/logger")
const { startListener, topics } = require('@auto-content-labs/messaging');

const { onMessage } = require("./messageHandler")

async function start() {
  try {

    logger.info("Application start")

    startListener(topics.dataCollectRequest, onMessage)

  } catch (error) {
    logger.error("Application failed to start:", error);
  }
}

start();
