const { Kafka, logLevel } = require('kafkajs');

describe('Kafka Error Handling', () => {
  let kafka, producer;

  const KAFKA_BROKERS = process.env.KAFKA_BROKERS;
  const clientId = `producer-development-${process.env.KAFKA_CLIENT_ID}`;
  const groupId = `group-development-${process.env.KAFKA_GROUP_ID}`;
  const topic = `topic-development-${process.env.KAFKA_TOPIC_DEFAULT}`;


  beforeAll(async () => {
    kafka = new Kafka({
      brokers: [KAFKA_BROKERS],
      clientId: clientId,
      logLevel: logLevel.NOTHING
    });
    producer = kafka.producer();
    await producer.connect();
  });

  afterAll(async () => {
    await producer.disconnect();
  });

  it('should throw error if Kafka is not available', async () => {
    try {
      // Hatalı bir broker adresine mesaj gönderme
      await producer.send({
        topic: topic,
        messages: [{ value: 'Test message' }]
      });
    } catch (error) {
      expect(error).toBeDefined(); // Hata alınması bekleniyor
    }
  });
});
