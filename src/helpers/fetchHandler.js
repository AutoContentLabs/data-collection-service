const { fetcher, formatURL } = require("@auto-content-labs/fetcher");
const { parseData } = require("./parser");

/**
 * Fetches data from a URL and parses it.
 * @param {string} url - The URL to fetch data from.
 * @returns {Object} Parsed data and its format.
 */
async function fetchDataAndParse(url) {
  if (typeof url !== "string" || !url.trim()) {
    throw new Error("Invalid URL: URL must be a non-empty string");
  }

  const formattedUrl = formatURL(url); // Ensure the URL is properly formatted

  let data;
  try {
    data = await fetcher(formattedUrl);
  } catch (fetchError) {
    throw new Error(`Failed to fetch data: ${fetchError.message}`);
  }

  if (!data) {
    throw new Error("No data fetched");
  }

  try {
    return await parseData(data); // Parse fetched data
  } catch (parseError) {
    throw new Error(`Failed to parse fetched data: ${parseError.message}`);
  }
}

module.exports = { fetchDataAndParse };
