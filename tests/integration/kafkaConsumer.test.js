// tests/integration/kafkaConsumer.test.js

const kafkaConfig = require("../../src/config/kafkaConfig");
const { Kafka } = require("kafkajs");

describe("Kafka Consumer", () => {
  let kafka, consumer;
  const topic = kafkaConfig.topics.DATA_COLLECT_REQUEST;
  beforeAll(async () => {
    kafka = new Kafka(kafkaConfig);
    consumer = kafka.consumer({ groupId: kafkaConfig.groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
  });

  afterAll(async () => {
    await consumer.disconnect();
  });

  it("should consume a message from Kafka", async () => {
    const receivedMessages = [];
    const messageHandler = jest.fn((message) => {
      receivedMessages.push(JSON.parse(message.value.toString()));
    });

    await consumer.run({ eachMessage: messageHandler });

    setTimeout(() => {
      expect(receivedMessages).toHaveLength(1);
      expect(receivedMessages[0].url).toBe("http://example.com");
    }, 5000);
  });
});
