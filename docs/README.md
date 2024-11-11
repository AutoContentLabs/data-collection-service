# Kafka Naming Convention

This document outlines the naming conventions for Kafka topics, clients, consumer groups, and environment configurations.

## 1. Topic Naming Convention

### Format:

`{service_name}.{action}.{resource}.{environment}`

**Explanation:**

- `service_name`: The name of the service. Example: `data_collector`, `job_scheduler`, `user_service`
- `action`: The action to be performed. Example: `collect`, `process`, `store`
- `resource`: The resource type. Example: `request`, `status`, `result`
- `environment`: The environment name. Example: `development`, `production`, `test`

### Example Topic Names:

- `data_collector.collect.request.production`
- `data_collector.collect.status.production`
- `job_scheduler.schedule.create.test`
- `job_scheduler.schedule.status.development`

## 2. Client Naming Convention

### Format:

`{service_name}.client.{environment}`

**Explanation:**

- `service_name`: The name of the service.
- `environment`: The environment name (e.g., `development`, `production`, `test`)

### Example Client Names:

- `data_collector.client.production`
- `data_collector.client.test`
- `job_scheduler.client.development`

## 3. Consumer Group Naming Convention

### Format:

`{service_name}.{action}.group.{environment}`

**Explanation:**

- `service_name`: The name of the service.
- `action`: The action name.
- `environment`: The environment name (e.g., `development`, `production`, `test`)

### Example Consumer Group Names:

- `data_collector.collect.group.production`
- `data_collector.collect.group.test`
- `job_scheduler.schedule.group.development`

## 4. .env File Structure

You can use different `.env` files for each environment to define the necessary Kafka broker connection details and topic names. Below is an example `.env` file structure:

### Example .env File (development):

```bash
# Kafka server
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=data_collector.client.development
KAFKA_GROUP_ID=data_collector.collect.group.development
KAFKA_LOG_LEVEL=5

# Kafka topics
KAFKA_TOPIC_DATA_COLLECT_REQUEST=data_collector.collect.request.development
KAFKA_TOPIC_DATA_COLLECT_STATUS=data_collector.collect.status.development
KAFKA_TOPIC_JOB_SCHEDULE=job_scheduler.schedule.create.development
KAFKA_TOPIC_JOB_STATUS=job_scheduler.schedule.status.development
```

### Example .env File (production):

```bash
# Kafka server
KAFKA_BROKERS=kafka.production:9092
KAFKA_CLIENT_ID=data_collector.client.production
KAFKA_GROUP_ID=data_collector.collect.group.production
KAFKA_LOG_LEVEL=5

# Kafka topics
KAFKA_TOPIC_DATA_COLLECT_REQUEST=data_collector.collect.request.production
KAFKA_TOPIC_DATA_COLLECT_STATUS=data_collector.collect.status.production
KAFKA_TOPIC_JOB_SCHEDULE=job_scheduler.schedule.create.production
KAFKA_TOPIC_JOB_STATUS=job_scheduler.schedule.status.production
```

### Example .env File (test):

```bash
# Kafka server
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=data_collector.client.test
KAFKA_GROUP_ID=data_collector.collect.group.test
KAFKA_LOG_LEVEL=5

# Kafka topics
KAFKA_TOPIC_DATA_COLLECT_REQUEST=data_collector.collect.request.test
KAFKA_TOPIC_DATA_COLLECT_STATUS=data_collector.collect.status.test
KAFKA_TOPIC_JOB_SCHEDULE=job_scheduler.schedule.create.test
KAFKA_TOPIC_JOB_STATUS=job_scheduler.schedule.status.test
```

## 5. Kafka Configuration (config.js)

We can manage the environment variables through a `config.js` file. Below is an example of the `config.js` file structure:

### config.js

```javascript
require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? "/.env.test" : ".env.production",
});

const config = {
  development: {
    KAFKA_BROKERS: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    KAFKA_CLIENT_ID:
      process.env.KAFKA_CLIENT_ID || "data_collector.client.development",
    KAFKA_GROUP_ID:
      process.env.KAFKA_GROUP_ID || "data_collector.collect.group.development",
    KAFKA_LOG_LEVEL: process.env.KAFKA_LOG_LEVEL || 5,
    KAFKA_TOPICS: {
      DATA_COLLECT_REQUEST:
        process.env.KAFKA_TOPIC_DATA_COLLECT_REQUEST ||
        "data_collector.collect.request.development",
      DATA_COLLECT_STATUS:
        process.env.KAFKA_TOPIC_DATA_COLLECT_STATUS ||
        "data_collector.collect.status.development",
      JOB_SCHEDULE:
        process.env.KAFKA_TOPIC_JOB_SCHEDULE ||
        "job_scheduler.schedule.create.development",
      JOB_STATUS:
        process.env.KAFKA_TOPIC_JOB_STATUS ||
        "job_scheduler.schedule.status.development",
    },
  },
  test: {
    KAFKA_BROKERS: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    KAFKA_CLIENT_ID:
      process.env.KAFKA_CLIENT_ID || "data_collector.client.test",
    KAFKA_GROUP_ID:
      process.env.KAFKA_GROUP_ID || "data_collector.collect.group.test",
    KAFKA_LOG_LEVEL: process.env.KAFKA_LOG_LEVEL || 5,
    KAFKA_TOPICS: {
      DATA_COLLECT_REQUEST:
        process.env.KAFKA_TOPIC_DATA_COLLECT_REQUEST ||
        "data_collector.collect.request.test",
      DATA_COLLECT_STATUS:
        process.env.KAFKA_TOPIC_DATA_COLLECT_STATUS ||
        "data_collector.collect.status.test",
      JOB_SCHEDULE:
        process.env.KAFKA_TOPIC_JOB_SCHEDULE ||
        "job_scheduler.schedule.create.test",
      JOB_STATUS:
        process.env.KAFKA_TOPIC_JOB_STATUS ||
        "job_scheduler.schedule.status.test",
    },
  },
  production: {
    KAFKA_BROKERS: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    KAFKA_CLIENT_ID:
      process.env.KAFKA_CLIENT_ID || "data_collector.client.production",
    KAFKA_GROUP_ID:
      process.env.KAFKA_GROUP_ID || "data_collector.collect.group.production",
    KAFKA_LOG_LEVEL: process.env.KAFKA_LOG_LEVEL || 5,
    KAFKA_TOPICS: {
      DATA_COLLECT_REQUEST:
        process.env.KAFKA_TOPIC_DATA_COLLECT_REQUEST ||
        "data_collector.collect.request.production",
      DATA_COLLECT_STATUS:
        process.env.KAFKA_TOPIC_DATA_COLLECT_STATUS ||
        "data_collector.collect.status.production",
      JOB_SCHEDULE:
        process.env.KAFKA_TOPIC_JOB_SCHEDULE ||
        "job_scheduler.schedule.create.production",
      JOB_STATUS:
        process.env.KAFKA_TOPIC_JOB_STATUS ||
        "job_scheduler.schedule.status.production",
    },
  },
};

module.exports = config[process.env.NODE_ENV || "development"];
```

## 6. Test Scenarios

When writing test scenarios for each environment, use the `.env.test` file for Kafka settings specific to the test environment. Ensure Kafka broker connections and topics are dedicated to the test environment.

### Test Environment .env (test):

```bash
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=data_collector.client.test
KAFKA_GROUP_ID=data_collector.collect.group.test
KAFKA_TOPIC_DATA_COLLECT_REQUEST=data_collector.collect.request.test
KAFKA_TOPIC_DATA_COLLECT_STATUS=data_collector.collect.status.test
KAFKA_TOPIC_JOB_SCHEDULE=job_scheduler.schedule.create.test
KAFKA_TOPIC_JOB_STATUS=job_scheduler.schedule.status.test
```

---

**End of Kafka Naming Convention Documentation**
