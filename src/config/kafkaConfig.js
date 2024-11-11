// src/config/kafkaConfig.js

const config = require("./config");

const kafkaConfig = {
  brokers: config.KAFKA_BROKERS,
  clientId: config.KAFKA_CLIENT_ID,
  groupId: config.KAFKA_GROUP_ID,
  logLevel: config.KAFKA_LOG_LEVEL,
  topics: config.KAFKA_TOPICS,
};

module.exports = kafkaConfig;
