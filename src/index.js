const { collectData } = require('./services/dataCollector');


// dbConfig.js içerisinden bağlantıyı alıyoruz
const { mysqlConnection } = require('./config/dbConfig');

// Verileri çekmek için bir fonksiyon tanımlayalım
function fetchDataFromMySQL(callback) {
  const query = 'SELECT * FROM view_service_full_overview_with_url WHERE service_status_id=1'; // Tablo adınızı burada belirtin

  mysqlConnection.query(query, (error, results, fields) => {
    if (error) {
      return callback(error, null);
    }
    // Eğer sorgu başarılı ise, sonuçları geri döndür
    callback(null, results);
  });
}

var services = []
// Örnek kullanım
fetchDataFromMySQL((error, results) => {
  if (error) {
    console.error("Veri çekme hatası:", error);
  } else {


    services = results

    results.forEach((row, index) => {

      // Row : {
      //   service_id: 10,
      //   service_type_name: 'API Service',
      //   access_type_id: 2,
      //   access_type_name: 'Web Rss/Xml',
      //   access_method_id: 2,
      //   access_method_name: 'Free',
      //   service_status_id: 1,
      //   service_status: 'Active',
      //   fetch_frequency: 300,
      //   time_interval: 0,
      //   next_fetch: null,
      //   last_fetched: null,
      //   last_error_message: null,
      //   language_code: 'TR',
      //   language_name: 'Turkish',
      //   country_code: 'TR',
      //   country_name: 'Turkey',
      //   data_format_id: 2,
      //   data_format_code: 'xml',
      //   platform_id: 1,
      //   platform_code: 'google_trends',
      //   platform_name: 'Google Trends',
      //   platform_description: 'Real-time trends by Google',
      //   platform_status_id: 1,
      //   platform_status: 'Active',
      //   full_url: 'https://trends.google.com/trending/rss?geo=TR'
      // }

      // console.log(`Row ${index + 1}:`, row);
    });


  }
});



var timeout = (1000 * 60) * 10;

setInterval(() => {



  services.forEach((service, index) => {


    collectData(service);
  })


}, timeout); // Her 10 dakika bir yürütülecek.

console.log("data-collection-service:start")
