const { parseData } = require("../../src/helpers/parser");
const cheerio = require("cheerio");

describe("parseData Tests", () => {
  test("should parse valid JSON string", async () => {
    const jsonData = JSON.stringify({ key: "value" });
    const result = await parseData(jsonData);
    expect(result).toEqual({ parsedData: { key: "value" }, format: "json" });
  });

  test("should parse valid HTML string", async () => {
    const htmlData = `
      <html>
        <head><title>Test Page</title></head>
        <body>
          <h1>Header 1</h1>
          <h1>Header 2</h1>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </body>
      </html>`;
    const result = await parseData(htmlData);
    expect(result).toEqual({
      parsedData: {
        title: "Test Page",
        headings: ["Header 1", "Header 2"],
        paragraphs: ["Paragraph 1", "Paragraph 2"],
      },
      format: "html",
    });
  });

  test("should parse valid XML string", async () => {
    const xmlData = `<note><to>Tove</to><from>Jani</from></note>`;
    const result = await parseData(xmlData);
    expect(result.format).toBe("xml");
    expect(result.parsedData).toHaveProperty("note");
    expect(result.parsedData.note.to[0]).toBe("Tove");
  });

  test("should return plain text for non-JSON/XML/HTML strings", async () => {
    const textData = "This is plain text data";
    const result = await parseData(textData);
    expect(result).toEqual({ parsedData: { text: textData }, format: "text" });
  });

  test("should throw an error for non-string input", async () => {
    await expect(parseData(12345)).rejects.toThrow("Data to parse must be a string");
  });

  test("should throw an error for invalid XML string", async () => {
    const invalidXml = "<note><to>Tove</to><from>Jani";
    await expect(parseData(invalidXml)).rejects.toThrow("Failed to parse XML");
  });
});
