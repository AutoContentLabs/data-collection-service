const { fetchDataAndParse } = require("../../src/helpers/fetchHandler");
const { parseData } = require("../../src/helpers/parser");
const { fetcher, formatURL } = require("@auto-content-labs/fetcher");

jest.mock("@auto-content-labs/fetcher", () => ({
  fetcher: jest.fn(),
  formatURL: jest.fn(),
}));

jest.mock("../../src/helpers/parser", () => ({
  parseData: jest.fn(),
}));

describe("fetchDataAndParse Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch and parse data successfully", async () => {
    const mockUrl = "https://example.com";
    const formattedUrl = "https://example.com";
    const mockFetchedData = "<html><title>Test</title></html>";
    const mockParsedData = { parsedData: { title: "Test" }, format: "html" };

    formatURL.mockReturnValue(formattedUrl);
    fetcher.mockResolvedValue(mockFetchedData);
    parseData.mockResolvedValue(mockParsedData);

    const result = await fetchDataAndParse(mockUrl);

    expect(formatURL).toHaveBeenCalledWith(mockUrl);
    expect(fetcher).toHaveBeenCalledWith(formattedUrl);
    expect(parseData).toHaveBeenCalledWith(mockFetchedData);
    expect(result).toEqual(mockParsedData);
  });

  test("should throw an error for invalid URL", async () => {
    const invalidUrl = "";

    await expect(fetchDataAndParse(invalidUrl)).rejects.toThrow(
      "Invalid URL: URL must be a non-empty string"
    );
    expect(formatURL).not.toHaveBeenCalled();
    expect(fetcher).not.toHaveBeenCalled();
    expect(parseData).not.toHaveBeenCalled();
  });

  test("should throw an error if fetcher fails", async () => {
    const mockUrl = "https://example.com";
    const formattedUrl = "https://example.com";

    formatURL.mockReturnValue(formattedUrl);
    fetcher.mockRejectedValue(new Error("Network error"));

    await expect(fetchDataAndParse(mockUrl)).rejects.toThrow("Failed to fetch data: Network error");

    expect(formatURL).toHaveBeenCalledWith(mockUrl);
    expect(fetcher).toHaveBeenCalledWith(formattedUrl);
    expect(parseData).not.toHaveBeenCalled();
  });

  test("should throw an error if no data is fetched", async () => {
    const mockUrl = "https://example.com";
    const formattedUrl = "https://example.com";

    formatURL.mockReturnValue(formattedUrl);
    fetcher.mockResolvedValue(null);

    await expect(fetchDataAndParse(mockUrl)).rejects.toThrow("No data fetched");

    expect(formatURL).toHaveBeenCalledWith(mockUrl);
    expect(fetcher).toHaveBeenCalledWith(formattedUrl);
    expect(parseData).not.toHaveBeenCalled();
  });

  test("should throw an error if parseData fails", async () => {
    const mockUrl = "https://example.com";
    const formattedUrl = "https://example.com/formatted";
    const mockFetchedData = "<html><title>Error</title></html>";

    formatURL.mockReturnValue(formattedUrl);
    fetcher.mockResolvedValue(mockFetchedData);
    parseData.mockRejectedValue(new Error("Parsing error"));

    await expect(fetchDataAndParse(mockUrl)).rejects.toThrow("Failed to parse fetched data: Parsing error");

    expect(formatURL).toHaveBeenCalledWith(mockUrl);
    expect(fetcher).toHaveBeenCalledWith(formattedUrl);
    expect(parseData).toHaveBeenCalledWith(mockFetchedData);
  });
});
