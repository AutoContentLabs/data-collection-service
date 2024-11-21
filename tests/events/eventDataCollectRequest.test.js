const path = require("path");
const { eventDataCollectRequest } = require("../../src/events/eventDataCollectRequest");
const { fetchDataAndParse } = require("../../src/helpers/fetchHandler");
const { fileWriter } = require("@auto-content-labs/messaging");

jest.mock("../../src/helpers/fetchHandler");
jest.mock("@auto-content-labs/messaging", () => ({
  logger: { info: jest.fn(), error: jest.fn(), notice: jest.fn() },
  helper: { getCurrentTimestamp: jest.fn().mockReturnValue(1234567890) },
  fileWriter: jest.fn(),
}));

describe("eventDataCollectRequest Tests", () => {
  const mockUrl = "example.com";
  const mockParsedData = { data: "mockData" };
  const mockFormat = "JSON";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should process a valid data collection request successfully", async () => {
    fetchDataAndParse.mockResolvedValue({ parsedData: mockParsedData, format: mockFormat });

    const mockData = {
      value: {
        id: "testId",
        source: "testSource",
        params: { url: mockUrl },
        timestamp: Date.now(),
      },
    };

    await eventDataCollectRequest(mockData);

    expect(fetchDataAndParse).toHaveBeenCalledWith(mockUrl);
    expect(fileWriter).toHaveBeenCalledWith(
      path.join(__dirname, "../../files/logs/sources.csv"),
      expect.stringContaining(mockUrl),
      true
    );
  });

  test("should log an error if value is missing", async () => {
    await eventDataCollectRequest({});

    expect(fetchDataAndParse).not.toHaveBeenCalled();
    expect(fileWriter).not.toHaveBeenCalled();
  });

  test("should log an error if URL is missing", async () => {
    const mockData = { value: { params: {} } };

    await eventDataCollectRequest(mockData);

    expect(fetchDataAndParse).not.toHaveBeenCalled();
    expect(fileWriter).not.toHaveBeenCalled();
  });

  test("should handle fetch errors gracefully", async () => {
    fetchDataAndParse.mockRejectedValue(new Error("Fetch error"));

    const mockData = {
      value: {
        id: "testId",
        params: { url: mockUrl },
        timestamp: Date.now(),
      },
    };

    await expect(eventDataCollectRequest(mockData)).rejects.toThrow("Fetch error");

    expect(fetchDataAndParse).toHaveBeenCalledWith(mockUrl);
    expect(fileWriter).not.toHaveBeenCalled();
  });
});
