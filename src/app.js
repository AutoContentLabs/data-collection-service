const { createProducer, createConsumer } = require('./kafka/kafkaClient');
const handleMessage = require('./services/messageHandler');
const logger = require('./utils/logger');

async function start() {
  try {
    await createProducer();
    logger.info('Kafka producer bağlandı.');

    await createConsumer('data_request_topic', handleMessage);
    logger.info('Kafka consumer is connected and listening...');
  } catch (error) {
    logger.error('Application failed to start:', error);
  }
}

start();
