// src/utils/logger.js

const winston = require("winston");
const path = require("path");

// Define log file paths for different environments
const logFilePath = path.join(__dirname, '../../logs/data_collector.log'); // Ensure the log folder exists

// Create logger instance
const logger = winston.createLogger({
  level: 'info',  // Default logging level is 'info'
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      // Custom log message format
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Add color for console output
        // winston.format.simple(), // Simple format for the console output,
        winston.format.printf(({ timestamp, level, message }) => {
          // Custom log message format
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: logFilePath,  // Write logs to a file
      maxsize: 5242880, // 5MB log file size limit before rotating
      maxFiles: 5, // Keep a maximum of 5 rotated log files
    }),
  ],
});

// Function to create the log directory if it doesn't exist
const fs = require("fs");
const logDirectory = path.dirname(logFilePath);

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });  // Create log directory if it doesn't exist
}

// Add additional transports dynamically for production or other environments if needed
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
