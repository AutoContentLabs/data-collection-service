// src/app.js

const { createProducer, createConsumer } = require("./kafka/kafkaClient");
const handleMessage = require("./services/messageHandler");
const logger = require("./utils/logger");
const topics = require("./config/topics");
async function start() {
  try {
    await createProducer();
    logger.info("Kafka producer connected.");

    await createConsumer(topics.DATA_COLLECT_REQUEST, handleMessage);
    logger.info("Kafka consumer is connected and listening...");
  } catch (error) {
    logger.error("Application failed to start:", error);
  }
}

start();
