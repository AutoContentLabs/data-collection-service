const { Kafka, logLevel } = require('kafkajs');

describe('Kafka Consumer', () => {
  let kafka, consumer;

  const KAFKA_BROKERS = process.env.KAFKA_BROKERS;
  const clientId = `consumer-development-${process.env.KAFKA_CLIENT_ID}`;
  const groupId = `group-development-${process.env.KAFKA_GROUP_ID}`;
  const topic = `topic-development-${process.env.KAFKA_TOPIC_DEFAULT}`;

  beforeAll(async () => {
    kafka = new Kafka({
      brokers: [KAFKA_BROKERS],
      clientId: clientId,
      logLevel: logLevel.NOTHING
    });
    consumer = kafka.consumer({ groupId: groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
  });

  afterAll(async () => {
    await consumer.disconnect();
  });

  it('should consume a message from Kafka', async () => {
    const receivedMessages = [];
    const messageHandler = jest.fn((message) => {
      receivedMessages.push(JSON.parse(message.value.toString()));
    });

    // Consumer'ı başlatıyoruz
    await consumer.run({ eachMessage: messageHandler });

    // 5 saniye bekleyelim, böylece mesajın alınması için zaman tanıyabiliriz
    setTimeout(() => {
      expect(receivedMessages).toHaveLength(1); // En az bir mesaj alınmalı
      expect(receivedMessages[0].url).toBe('http://example.com'); // Gönderilen mesajın içeriği ile eşleşmeli
    }, 5000); // 5 saniye bekleme süresi
  });
});
