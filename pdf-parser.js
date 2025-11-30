import pdfParse from 'pdf-parse';

/**
 * Parses text content from a PDF buffer
 * @param {Buffer} pdfBuffer - The PDF file as a buffer
 * @returns {Promise<string>} - The extracted text content
 */
export const parsePdf = async (pdfBuffer) => {
  try {
    const pdfData = await pdfParse(pdfBuffer);
    return pdfData.text;
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
};

/**
 * Extracts tax slip information from a PDF file
 * @param {Buffer} pdfBuffer - The PDF file as a buffer
 * @returns {Promise<Object>} - The extracted tax slip information
 */
export const extractTaxSlipFromPdf = async (pdfBuffer) => {
  try {
    // First, parse the text content from the PDF
    const textContent = await parsePdf(pdfBuffer);

    // Use the existing email-text-parser functionality to extract tax slip info
    // This reuses the same logic that handles email and text message parsing
    const { handleWebhookData } = await import('./email-text-parser.js');
    const result = await handleWebhookData({ text: textContent });

    return result;
  } catch (error) {
    throw new Error(`Failed to extract tax slip information from PDF: ${error.message}`);
  }
};