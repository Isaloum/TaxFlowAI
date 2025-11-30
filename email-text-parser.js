// email-text-parser.js - Extracts tax slip information from emails, text messages, and other sources
import { parseIncomeSlip } from './income-slip-parser.js';

// Function to extract text content from an email object
export function extractEmailText(emailData) {
  // Handle different email formats
  if (typeof emailData === 'string') {
    return emailData;
  }
  
  if (emailData.body) {
    // Gmail-like format
    return emailData.body.text || emailData.body.html || emailData.body;
  }
  
  if (emailData.text) {
    // Simple text format
    return emailData.text;
  }
  
  if (emailData.content) {
    // Generic content format
    return emailData.content;
  }
  
  if (emailData.snippet) {
    // Gmail snippet
    return emailData.snippet;
  }
  
  return '';
}

// Function to extract text content from a text message
export function extractTextMessageText(textData) {
  if (typeof textData === 'string') {
    return textData;
  }
  
  if (textData.message) {
    return textData.message;
  }
  
  if (textData.text) {
    return textData.text;
  }
  if (textData.content) {
    return textData.content;
  }
  
  return '';
}

// Function to extract text content from n8n webhook data
export function extractN8nText(n8nData) {
  if (typeof n8nData === 'string') {
    return n8nData;
  }
  
  if (n8nData.body) {
    if (typeof n8nData.body === 'string') {
      return n8nData.body;
    }
    // Handle JSON body
    return JSON.stringify(n8nData.body);
  }
  
  if (n8nData.text) {
    return n8nData.text;
  }
  
  if (n8nData.message) {
    return n8nData.message;
  }
  
  // Look for common n8n fields that might contain text
  for (const key in n8nData) {
    if (typeof n8nData[key] === 'string' && n8nData[key].length > 20) { // Likely to contain text content
      return n8nData[key];
    }
  }
  
  return '';
}

// Main function to parse text from any source and extract tax slip information
export function parseTaxSlipFromSource(sourceData, sourceType = 'auto') {
  let textContent = '';
  
  switch (sourceType.toLowerCase()) {
    case 'email':
      textContent = extractEmailText(sourceData);
      break;
    case 'text':
    case 'sms':
      textContent = extractTextMessageText(sourceData);
      break;
    case 'n8n':
    case 'webhook':
      textContent = extractN8nText(sourceData);
      break;
    case 'auto':
    default:
      // Auto-detect the source type based on the structure of the data
      textContent = autoDetectAndExtract(sourceData);
      break;
  }
  
  // Parse the extracted text for tax slip information
  return parseIncomeSlip(textContent);
}

// Function to auto-detect source type and extract text accordingly
function autoDetectAndExtract(data) {
  if (typeof data === 'string') {
    // If it's just a string, return it as-is
    return data;
  }
  
  // Check for email-like properties
  if (data.from || data.to || data.subject || data.body || data.snippet) {
    return extractEmailText(data);
  }
  
  // Check for text message-like properties
  if (data.sender || data.recipient || data.message || data.text) {
    return extractTextMessageText(data);
  }
  
  // Check for n8n/webhook-like properties
  if (data.webhook || data.body || data.headers || data.query) {
    return extractN8nText(data);
  }
  
  // If none of the above match, try to find string values in the object
  if (typeof data === 'object') {
    for (const key in data) {
      if (typeof data[key] === 'string' && data[key].length > 20) {
        // Check if this string looks like it might contain tax information
        if (looksLikeTaxText(data[key])) {
          return data[key];
        }
      }
    }
  }
  
  // If no text found, return empty string
  return '';
}

// Helper function to check if text looks like it might contain tax information
function looksLikeTaxText(text) {
  const taxKeywords = [
    'revenu', 'income', 'box', 'case', 'slip', 'rl-1', 't4', 'sin', 'nas',
    'employment', 'revenu québec', 'cra', 'agency', 'revenu canada', 'cpp', 'qpp',
    'ei', 'ppip', 'union', 'cotisations', 'dues', 'revenu d\'emploi', 'employment income'
  ];
  
  const lowerText = text.toLowerCase();
  return taxKeywords.some(keyword => lowerText.includes(keyword));
}

// Function to handle incoming webhook data (for n8n integration)
export async function handleWebhookData(webhookData) {
  try {
    const slipData = parseTaxSlipFromSource(webhookData, 'auto');
    
    if (!slipData.isValid()) {
      return {
        success: false,
        error: 'No valid tax slip information found in the provided data',
        warnings: slipData.warnings()
      };
    }
    
    return {
      success: true,
      slip: slipData
    };
  } catch (error) {
    return {
      success: false,
      error: `Error parsing tax slip data: ${error.message}`
    };
  }
}

// Function to extract tax slip information from a text string (for direct text input)
export function parseTaxSlipFromText(text) {
  return parseTaxSlipFromSource(text, 'auto');
}