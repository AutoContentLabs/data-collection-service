const { Kafka, logLevel } = require('kafkajs');

describe('Kafka Integration Test', () => {
  let kafka, producer, consumer;

  const KAFKA_BROKERS = process.env.KAFKA_BROKERS;
  const clientId = `integration-development-${process.env.KAFKA_CLIENT_ID}`;
  const groupId = `group-integration-development-${process.env.KAFKA_GROUP_ID}`;
  const topic = `topic-development-${process.env.KAFKA_TOPIC_DEFAULT}`;

  beforeAll(async () => {
    kafka = new Kafka({
      brokers: [KAFKA_BROKERS],
      clientId: clientId,
      logLevel: logLevel.NOTHING
    });

    producer = kafka.producer();
    consumer = kafka.consumer({ groupId: groupId });

    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
  });

  afterAll(async () => {
    await producer.disconnect();
    await consumer.disconnect();
  });

  it('should send and consume a message', async () => {
    const message = { url: 'http://example.com' };

    // Producer ile mesaj gönderme
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }]
    });

    const receivedMessages = [];
    const messageHandler = jest.fn((message) => {
      receivedMessages.push(JSON.parse(message.value.toString()));
    });

    // Consumer'ı başlatıyoruz ve mesajı almaya başlıyoruz
    await consumer.run({ eachMessage: messageHandler });

    // 5 saniye bekleyelim, böylece mesajın alınması için zaman tanıyabiliriz
    setTimeout(() => {
      expect(receivedMessages).toHaveLength(1);
      expect(receivedMessages[0].url).toBe(message.url); // Mesajın içeriği doğru olmalı
    }, 5000); // 5 saniye bekleme süresi
  });
});
