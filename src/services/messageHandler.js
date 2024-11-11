// src/services/messageHandler.js

const kafkaConfig = require("../../src/config/kafkaConfig");

const fetchData = require("./fetchData");
const { sendMessage } = require("../kafka/kafkaClient");

async function handleMessage(message) {
  const { url } = JSON.parse(message.value.toString());
  console.info(`Data is being pulled:`, url);

  const result = await fetchData(url);

  const responseMessage = {
    status: result.success ? "success" : "failure",
    url: url,
    data: result.success ? result.data : null,
    error: result.success ? null : result.error,
    timestamp: new Date().toISOString(),
  };

  const responseTopic = kafkaConfig.topics.DATA_COLLECT_STATUS;
  console.log("response", responseTopic);
  console.log("responseMessage", responseMessage);
  await sendMessage(responseTopic, responseMessage);
}

module.exports = handleMessage;
