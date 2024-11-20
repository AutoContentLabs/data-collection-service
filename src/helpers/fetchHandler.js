const { fetcher, formatURL } = require("@auto-content-labs/fetcher");
const { parseData } = require("./parser");

/**
 * Fetches data from a URL and parses it.
 * @param {string} url - The URL to fetch data from.
 * @returns {Object} Parsed data.
 */
async function fetchDataAndParse(url) {
  const formattedUrl = formatURL(url); // Ensure the URL is properly formatted
  const data = await fetcher(formattedUrl);

  if (!data) {
    throw new Error("No data fetched");
  }

  return parseData(data); // Parse fetched data
}

module.exports = { fetchDataAndParse };
