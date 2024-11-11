// tests/mock/kafkaClient.test.js

const kafkaConfig = require("../../src/config/kafkaConfig");
const { Kafka } = require("kafkajs");

// Mock the Kafka producer and consumer
jest.mock("kafkajs", () => {
  return {
    Kafka: jest.fn().mockImplementation(() => ({
      producer: jest.fn().mockReturnValue({
        connect: jest.fn(),
        send: jest.fn(),
      }),
      consumer: jest.fn().mockReturnValue({
        connect: jest.fn(),
        subscribe: jest.fn(),
      }),
    })),
  };
});

describe("Kafka Client", () => {
  let kafka;
  let producer;
  let consumer;

  beforeEach(() => {
    kafka = new Kafka(kafkaConfig);
    producer = kafka.producer();
    consumer = kafka.consumer({ groupId: kafkaConfig.groupId });
  });

  it("should create a producer and connect", async () => {
    await producer.connect();
    expect(producer.connect).toHaveBeenCalled();
  });

  it("should create a consumer and connect", async () => {
    await consumer.connect();
    expect(consumer.connect).toHaveBeenCalled();
  });

  it("should send a message to Kafka", async () => {
    const message = { url: "http://example.com" };
    await producer.send({
      topic: kafkaConfig.topics.DATA_COLLECT_REQUEST,
      messages: [{ value: JSON.stringify(message) }],
    });
    expect(producer.send).toHaveBeenCalledWith({
      topic: kafkaConfig.topics.DATA_COLLECT_REQUEST,
      messages: [{ value: JSON.stringify(message) }],
    });
  });
});
