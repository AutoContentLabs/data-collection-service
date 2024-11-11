// src/config/config.js

require("@dotenvx/dotenvx").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const environment = process.env.NODE_ENV || "development";
const topics = require("./topics");

const config = {
  KAFKA_BROKERS: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  KAFKA_CLIENT_ID:
    process.env.KAFKA_CLIENT_ID || `data_collector.client.${environment}`,
  KAFKA_GROUP_ID:
    process.env.KAFKA_GROUP_ID || `data_collector.collect.group.${environment}`,
  KAFKA_LOG_LEVEL: process.env.KAFKA_LOG_LEVEL || 5,
  KAFKA_TOPICS: topics,
};

module.exports = config;
