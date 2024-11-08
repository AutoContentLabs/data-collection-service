// dbConfig.js
require('dotenv').config();
const mysql = require('mysql2');
const { MongoClient } = require('mongodb');

// MySQL bağlantısı
const mysqlConnection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// MongoDB bağlantısı
const mongoClient = new MongoClient(process.env.MONGO_URI, {});

module.exports = {
  mysqlConnection,
  mongoClient,
};
