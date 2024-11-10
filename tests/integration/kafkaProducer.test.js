const { Kafka, logLevel } = require('kafkajs');

describe('Kafka Producer', () => {
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

  it('should send a message to Kafka', async () => {
    const message = { url: 'http://example.com' };

    await producer.send({
      topic: topic,
      messages: [{ value: JSON.stringify(message) }]
    });

    // Mesaj başarıyla gönderildiği için burada herhangi bir hata fırlatılması, testin başarısız olduğu anlamına gelir.
    expect(true).toBe(true); // Kafka'ya mesaj gönderildiği sürece test başarılı sayılır.
  });
});
