const { Kafka } = require('kafkajs');
const kafkaConfig = require("../config/kafkaConfig")
const kafka = new Kafka(kafkaConfig);

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: kafkaConfig.groupId });

async function createProducer() {
  await producer.connect();
}

async function createConsumer(topic, messageHandler) {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  consumer.run({
    eachMessage: async ({ message }) => {
      messageHandler(message);
    },
  });
}

async function sendMessage(topic, message) {
  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(message) },
    ],
  });
}

module.exports = {
  createProducer,
  createConsumer,
  sendMessage,
};
