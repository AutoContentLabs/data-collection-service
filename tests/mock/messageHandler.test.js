// tests/mock/messageHandler.test.js

const kafkaConfig = require("../../src/config/kafkaConfig");

const handleMessage = require("../../src/services/messageHandler");
const fetchData = require("../../src/services/fetchData");
const { sendMessage } = require("../../src/kafka/kafkaClient");

jest.mock("../../src/services/fetchData");
jest.mock("../../src/kafka/kafkaClient");

describe("Message Handler", () => {
  it("should handle the message and send a success response", async () => {
    fetchData.mockResolvedValue({ success: true, data: { key: "value" } });

    const message = { value: JSON.stringify({ url: "http://example.com" }) };

    await handleMessage(message);

    expect(sendMessage).toHaveBeenCalledWith(
      kafkaConfig.topics.DATA_COLLECT_STATUS,
      expect.objectContaining({
        status: "success",
        url: "http://example.com",
        data: { key: "value" },
      })
    );
  });

  it("should handle the message and send a failure response on error", async () => {
    fetchData.mockResolvedValue({ success: false, error: "Network Error" });

    const message = { value: JSON.stringify({ url: "http://example.com" }) };

    await handleMessage(message);

    expect(sendMessage).toHaveBeenCalledWith(
      kafkaConfig.topics.DATA_COLLECT_STATUS,
      expect.objectContaining({
        status: "failure",
        url: "http://example.com",
        error: "Network Error",
      })
    );
  });
});
