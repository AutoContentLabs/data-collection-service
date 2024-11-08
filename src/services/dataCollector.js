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
      // default info
      title: item.title,
      traffic: item["ht:approx_traffic"],

      // location info
      // region: none,
      country_code: service.country_code, // TR
      country_name: service.country_name, // Turkey
      language_code: service.language_code, // TR
      language_name: service.language_name, // Turkish

      // record info
      timestamp: new Date().toISOString(),

      // report info
      platform: service.platform_code,
      provider: 'google_llc',

      // source info
      description: item.description,
      link: item.link,
      pubDate: new Date(item.pubDate),
      picture: item["ht:picture"],
      pictureSource: item["ht:picture_source"],

      // track info
      data_schema_id: 7, // Trend Data
      service_id: service.service_id,
      platform_id: service.platform_id, // google_trends,
      provider_id: 1, // google_llc,

      // document info
      data_format_id: service.data_format_id,

      // cron info
      fetch_frequency: service.fetch_frequency,
      time_interval: service.time_interval,
      next_fetch: service.next_fetch,
      last_fetched: service.last_fetched,

      // processing info
      service_type_name: service.service_type_name, // API Service
      access_method_id: service.access_method_id, // 2 : Free
      access_type_id: service.access_type_id, // 2 : Web Rss/Xml
      full_url: service.full_url, // service url address
      last_error_message: service.last_error_message,
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
      data_schema_id: 7, // Trend Data
      service_id: service.service_id,
      platform_id: service.platform_id, // google_trends,
      provider_id: 1, // google_llc,
      records: trends,
      record_count: trends.length,
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
