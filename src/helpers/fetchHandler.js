const { fetcher, formatURL } = require("@auto-content-labs/fetcher");
const { parseData } = require("./parser");

/**
 * Custom error class: Fetch operation errors
 */
class FetchError extends Error {
  constructor(message, url = null) {
    super(message);
    this.name = 'FetchError';
    this.url = url;
    this.timestamp = new Date().toISOString();
  }

  logError() {
    // Custom logging for fetch errors
    console.error(`[${this.timestamp}] FetchError: ${this.message}`);
    if (this.url) {
      console.error(`URL: ${this.url}`);
    }
  }
}

/**
 * Custom error class: Parsing errors
 */
class ParseError extends Error {
  constructor(message, data = null) {
    super(message);
    this.name = 'ParseError';
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  logError() {
    // Custom logging for parse errors
    console.error(`[${this.timestamp}] ParseError: ${this.message}`);
    if (this.data) {
      console.error("Data: ", this.data);
    }
  }
}

/**
 * Custom error class: Invalid URL errors
 */
class InvalidUrlError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidUrlError';
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Fetch data from the given URL and parse it.
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Object>} Parsed data and its format.
 * @throws {FetchError | ParseError | InvalidUrlError} If an error occurs.
 */
async function fetchDataAndParse(url) {
  if (typeof url !== "string" || !url.trim()) {
    const error = new InvalidUrlError("Invalid URL: URL must be a non-empty string");
    throw error;
  }

  const formattedUrl = formatURL(url); // Format URL

  let data;
  try {
    // Attempt to fetch the data
    data = await fetcher(formattedUrl, {
      timeout: 1000,    // Increased timeout to handle slower connections
      maxRetries: 1,    // Allow for retries on failure
      retryDelay: 300,  // Retry delay in ms
      log: false        // Disable internal logging to avoid clutter
    });
  } catch (fetchError) {
    const error = new FetchError(`Failed to fetch data from URL: ${fetchError.message}`, formattedUrl);
    throw error;
  }

  if (!data) {
    const error = new FetchError("No data fetched", formattedUrl);
    throw error;
  }

  try {
    // Attempt to parse the data
    return await parseData(data);
  } catch (parseError) {
    const error = new ParseError(`Failed to parse fetched data: ${parseError.message}`, data);
    throw error;
  }
}

module.exports = { fetchDataAndParse, FetchError, ParseError, InvalidUrlError };
