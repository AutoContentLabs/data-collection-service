// tests/mock/fetchData.test.js

const fetchData = require("../../src/services/fetchData");
const axios = require("axios");

jest.mock("axios");

describe("fetchData", () => {
  it("should fetch data successfully from URL", async () => {
    // Mock axios response
    axios.get.mockResolvedValue({ data: { key: "value" } });

    const result = await fetchData("http://example.com");
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ key: "value" });
  });

  it("should handle failure when URL is invalid", async () => {
    // Mock axios error
    axios.get.mockRejectedValue(new Error("Network Error"));

    const result = await fetchData("http://invalid-url.com");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Network Error");
  });
});
