const cheerio = require("cheerio");
const xml2js = require("xml2js");

/**
 * Parses fetched data into a structured format.
 * @param {string} data - The data to parse.
 * @returns {Object} Parsed data.
 */
async function parseData(data) {
  if (typeof data === "string") {
    try {
      return JSON.parse(data); // Try parsing as JSON
    } catch (e) {
      if (data.startsWith("<html")) {
        const $ = cheerio.load(data);
        return {
          title: $("title").text(),
          headings: $("h1").map((_, el) => $(el).text()).get(),
          paragraphs: $("p").map((_, el) => $(el).text()).get(),
        };
      } else if (data.startsWith("<")) {
        return await xml2js.parseStringPromise(data); // Parse as XML
      } else {
        return { text: data }; // Return plain text
      }
    }
  }

  throw new Error("Unsupported data format");
}

module.exports = { parseData };
