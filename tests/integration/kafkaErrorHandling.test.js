// tests/integration/kafkaErrorHandling.test.js

const kafkaConfig = require("../../src/config/kafkaConfig");
const { Kafka } = require("kafkajs");

describe("Kafka Error Handling", () => {
  let kafka, producer;
  const topic = kafkaConfig.topics.DATA_COLLECT_REQUEST;
  beforeAll(async () => {
    kafka = new Kafka(kafkaConfig);
    producer = kafka.producer();
    await producer.connect();
  });

  afterAll(async () => {
    await producer.disconnect();
  });

  it("should throw error if Kafka is not available", async () => {
    try {
      await producer.send({
        topic: topic,
        messages: [{ value: "Test message" }],
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
