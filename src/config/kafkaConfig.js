// src/config/kafkaConfig.js
require("dotenv").config();

const KAFKA_BROKERS = process.env.KAFKA_BROKERS
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID
const KAFKA_TOPIC_DEFAULT = process.env.KAFKA_TOPIC_DEFAULT

module.exports = {
  brokers: [KAFKA_BROKERS],
  clientId: KAFKA_CLIENT_ID,
  groupId: KAFKA_GROUP_ID,
  KAFKA_TOPIC_DEFAULT: KAFKA_TOPIC_DEFAULT
};
