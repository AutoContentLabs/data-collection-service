// kafkaProducer.js
require('dotenv').config();
const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER });
const producer = new Producer(client);

function sendKafkaSignal(topic, message) {
  const payloads = [{ topic, messages: JSON.stringify(message) }];
  producer.send(payloads, (err, data) => {
    if (err) console.error('Kafka sinyal hatası:', err);
    else console.log('Kafka sinyali gönderildi:', data);
  });
}

module.exports = { sendKafkaSignal };
