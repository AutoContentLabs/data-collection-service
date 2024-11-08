const axios = require('axios');
const xml2js = require('xml2js');
const { mongoClient } = require('../config/dbConfig');
const { sendKafkaSignal } = require('./kafkaProducer');

// Tek seferlik MongoDB bağlantısı
let database;
let collection;

async function initializeDbConnection() {
  if (!database) {
    try {
      await mongoClient.connect();
      database = mongoClient.db('data_collection');
      collection = database.collection('trends');
      console.log("MongoDB bağlantısı başarıyla kuruldu.");
    } catch (error) {
      console.error("MongoDB bağlantısı kurulamadı:", error);
      throw error;
    }
  }
}

async function collectData(service) {
  console.log("Veri toplama işlemi başladı.");
  var trends;
  try {
    // Google Trends RSS akışından veri çekme
    const response = await axios.get(service.full_url);
    const xmlData = response.data;

    // XML verisini JSON formatına dönüştürme
    const parser = new xml2js.Parser({ explicitArray: false });
    const jsonData = await parser.parseStringPromise(xmlData);

    // Yapılandırılmış veriyi ayıklama
    trends = jsonData.rss.channel.item.map(item => ({
      title: item.title,
      approxTraffic: item["ht:approx_traffic"],
      description: item.description,
      link: item.link,
      pubDate: new Date(item.pubDate),
      picture: item["ht:picture"],
      pictureSource: item["ht:picture_source"],
      service
    }));

    // MongoDB'ye veri kaydetme
    await initializeDbConnection(); // Bağlantıyı başlat veya kullan
    await collection.insertMany(trends);
    console.log(new Date().toISOString(), 'Veri başarıyla MongoDB’ye kaydedildi.');



  } catch (error) {
    console.error('Veri toplama hatası:', error);
  }

  try {
    // Kafka ile sinyal gönderme
    sendKafkaSignal('data-collection-complete', {
      status: 'complete',
      source: 'Google Trends',
      recordCount: trends.length,
      timestamp: new Date()
    });

    console.log(new Date().toISOString(), 'sinyal başarıyla gönderildi.');
  } catch (error) {
    console.error('sinyal gönderme hatası:', error);
  }

}

// Uygulama kapanırken bağlantıyı kapatma
process.on('exit', async () => {
  if (mongoClient) {
    await mongoClient.close();
    console.log("MongoDB bağlantısı kapatıldı.");
  }
});

module.exports = { collectData };
