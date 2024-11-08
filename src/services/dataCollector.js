const axios = require('axios');
const xml2js = require('xml2js');
const { mongoClient, mysqlConnection } = require('../config/dbConfig');
const { sendKafkaSignal } = require('./kafkaProducer');

async function collectData() {
  console.log("Veri toplama işlemi başladı.");
  try {
    // Google Trends RSS akışından veri çekme
    const response = await axios.get('https://trends.google.com/trending/rss?geo=US');
    const xmlData = response.data;

    // XML verisini JSON formatına dönüştürme
    const parser = new xml2js.Parser({ explicitArray: false });
    const jsonData = await parser.parseStringPromise(xmlData);

    // Yapılandırılmış veriyi ayıklama
    const trends = jsonData.rss.channel.item.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: new Date(item.pubDate),
      description: item.description
    }));

    // MongoDB'ye bağlantı ve veriyi kaydetme
    await mongoClient.connect();
    const database = mongoClient.db('data_collection');
    const collection = database.collection('trends');
    await collection.insertMany(trends);

    console.log(Date.now(),'Veri başarıyla MongoDB’ye kaydedildi.');

    // Kafka ile sinyal gönderme
    sendKafkaSignal('data-collection-complete', {
      status: 'complete',
      source: 'Google Trends',
      recordCount: trends.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Veri toplama hatası:', error);
  } finally {
    await mongoClient.close();
  }
}

module.exports = { collectData };
