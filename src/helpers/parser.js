// src\helpers\parser.js
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
      const jsonData = JSON.parse(data); // Try parsing as JSON
      return { parsedData: jsonData, format: "json" };
    } catch (e) {
      if (data.startsWith("<html")) {
        const $ = cheerio.load(data);
        return {
          parsedData: {
            title: $("title").text(),
            headings: $("h1").map((_, el) => $(el).text()).get(),
            paragraphs: $("p").map((_, el) => $(el).text()).get(),
          },
          format: "html"
        };
      } else if (data.startsWith("<")) {
        return await xml2js.parseStringPromise(data).then(parsedXml => ({
          parsedData: parsedXml,
          format: "xml"
        }));
      } else {
        return { parsedData: { text: data }, format: "text" }; // Return plain text
      }
    }
  }

  throw new Error("Unsupported data format");
}


module.exports = { parseData };
