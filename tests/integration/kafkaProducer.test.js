// tests/integration/kafkaProducer.test.js

const kafkaConfig = require("../../src/config/kafkaConfig");
const { Kafka } = require("kafkajs");

describe("Kafka Producer", () => {
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

  it("should send a message to Kafka", async () => {
    const message = { url: "http://example.com" };

    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });

    expect(true).toBe(true);
  });
});
