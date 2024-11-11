// src/services/fetchData.js

const axios = require("axios");

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = fetchData;
