# Data Collection Service

This service collects data from external data sources and stores it as raw data in MongoDB. It sends a signal via Kafka when data collection is complete.

## Technologies Used
- **MySQL**: Administrative records (data source information, access information, timer information)
- **Node.js**: Manages data collection operations.
- **MongoDB**: Raw data store (Data Lake)
- **Kafka**: Sends a signal when data collection is complete.
- **Docker**: Enables the service to run in a container.