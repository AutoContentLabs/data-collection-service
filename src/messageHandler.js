const logger = require("./utils/logger");
const { sendLogRequest, sendDataCollectResponseRequest, sendDataCollectStatusRequest, sendDataCollectErrorRequest } = require('@auto-content-labs/messaging');
const { fetcher, formatURL } = require("@auto-content-labs/fetcher");
const cheerio = require("cheerio"); // HTML ayrıştırma için
const xml2js = require("xml2js"); // XML ayrıştırma için

/**
 * Incoming message processing function
 * 
 * @param {Object} message - Incoming message
 */
async function onMessage({ key, value, topic, timestamp, headers }) {

  if (!value) {
    logger.error("No value found in the message");
    return;
  }

  // Check message format
  if (value.params && value.params.url) {
    let url = value.params.url;

    // Format the URL before making a request using the fetcher utility
    url = formatURL(url); // Ensures the URL has a proper schema (https://)

    await sendLogRequest({ logId: new Date().toString(), message: `Data processing start ${url}`, level: "info", timestamp: new Date().toISOString() });

    try {
      // Fetch data using the fetcher utility with timeout and retry logic
      const data = await fetcher(url);

      if (data) {
        console.log("data type", typeof data);

        let resultObject = null;

        if (typeof data === "string") {
          try {
            // JSON formatında mı?
            const json = JSON.parse(data);
            console.log("JSON formatında veri", json);
            resultObject = json;
          } catch (e) {
            if (data.startsWith("<")) {
              console.log("HTML veya XML formatında veri");

              if (data.startsWith("<html")) {
                // HTML ayrıştırma
                const $ = cheerio.load(data);
                resultObject = {
                  title: $("title").text(),
                  headings: $("h1").map((_, el) => $(el).text()).get(),
                  paragraphs: $("p").map((_, el) => $(el).text()).get()
                };
              } else {
                // XML ayrıştırma
                const parsedXml = await xml2js.parseStringPromise(data);
                resultObject = parsedXml;
              }
            } else {
              console.log("Düz metin formatında veri");
              resultObject = { text: data };
            }
          }
        } else {
          console.error("Beklenmeyen veri formatı:", typeof data);
        }

        if (resultObject) {
          await sendDataCollectResponseRequest({
            id: new Date().toISOString(),
            data: resultObject, // Veriyi nesne formatında gönderiyoruz
            timestamp: new Date().toISOString()
          });

          await sendDataCollectStatusRequest({
            id: new Date().toISOString(),
            status: "completed",
            message: "Data collection is completed.",
            timestamp: new Date().toISOString()
          });
        } else {
          console.log("Veri nesneye dönüştürülemedi:", data);
        }
      } else {

        await sendDataCollectErrorRequest({
          id: new Date().toISOString(),
          errorCode: "DATA_FETCH_EMPTY",
          errorMessage: `No data fetched from ${url}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {

      await sendLogRequest({
        logId: new Date().toISOString(),
        message: `Error fetching data from ${url}: ${error.message}`,
        level: "error",
        timestamp: new Date().toISOString()
      });

      await sendDataCollectErrorRequest({
        id: new Date().toISOString(),
        errorCode: "DATA_FETCH_ERROR",
        errorMessage: `${error.message} ${url}`,
        timestamp: new Date().toISOString()
      });

      await sendDataCollectStatusRequest({
        id: new Date().toISOString(),
        status: "failed",
        message: "Data collection is failed.",
        timestamp: new Date().toISOString()
      });
    }
  } else {

    await sendLogRequest({
      logId: new Date().toISOString(),
      message: "Invalid message format",
      level: "error",
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = { onMessage };
