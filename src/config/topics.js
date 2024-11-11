// src/config/topics.js

const environment = process.env.NODE_ENV || "development";

const commonTopics = {
  DATA_COLLECT_REQUEST: "data_collector.collect.request",
  DATA_COLLECT_STATUS: "data_collector.collect.status",
  JOB_SCHEDULE: "job_scheduler.schedule.create",
  JOB_STATUS: "job_scheduler.schedule.status",
};

const getTopicForEnvironment = (topic) => {
  const topicEnvVar = process.env[`KAFKA_TOPIC_${topic.toUpperCase()}`];
  if (topicEnvVar) {
    return topicEnvVar;
  }
  const commonTopic = commonTopics[topic];
  if (!commonTopic) {
    throw new Error(`Topic ${topic} is not defined in commonTopics`);
  }
  return `${commonTopic}.${environment}`;
};

module.exports = {
  DATA_COLLECT_REQUEST: getTopicForEnvironment("DATA_COLLECT_REQUEST"),
  DATA_COLLECT_STATUS: getTopicForEnvironment("DATA_COLLECT_STATUS"),
  JOB_SCHEDULE: getTopicForEnvironment("JOB_SCHEDULE"),
  JOB_STATUS: getTopicForEnvironment("JOB_STATUS"),
};
