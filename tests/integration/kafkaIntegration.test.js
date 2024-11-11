// tests/integration/kafkaIntegration.test.js

const kafkaConfig = require("../../src/config/kafkaConfig");
const { Kafka } = require("kafkajs");

describe("Kafka Integration Test", () => {
  let kafka, producer, consumer;
  const topic = kafkaConfig.topics.DATA_COLLECT_REQUEST;

  beforeAll(async () => {
    kafka = new Kafka(kafkaConfig);

    producer = kafka.producer();
    consumer = kafka.consumer({ groupId: kafkaConfig.groupId });

    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
  });

  afterAll(async () => {
    await producer.disconnect();
    await consumer.disconnect();
  });

  it("should send and consume a message", async () => {
    const message = { url: "http://example.com" };

    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });

    const receivedMessages = [];
    const messageHandler = jest.fn((message) => {
      receivedMessages.push(JSON.parse(message.value.toString()));
    });

    await consumer.run({ eachMessage: messageHandler });

    setTimeout(() => {
      expect(receivedMessages).toHaveLength(1);
      expect(receivedMessages[0].url).toBe(message.url);
    }, 5000);
  });
});
