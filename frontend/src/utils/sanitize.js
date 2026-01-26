import DOMPurify from 'dompurify';

/**
 * Sanitization utilities for user inputs
 * Prevents XSS attacks and other security vulnerabilities
 */

/**
 * Sanitize HTML content
 * Use this for rich text content that may contain HTML
 * @param {string} dirty - Unsanitized HTML string
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize plain text (strips all HTML)
 * Use this for user names, titles, simple text fields
 * @param {string} dirty - Unsanitized string
 * @returns {string} - Plain text without HTML
 */
export const sanitizeText = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize URL to prevent javascript: and data: URIs
 * @param {string} url - URL to sanitize
 * @returns {string} - Safe URL
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') return '';

  // Remove javascript: and data: URIs
  const cleaned = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  // Validate it's a proper URL
  try {
    const urlObj = new URL(cleaned);
    // Only allow http, https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return cleaned;
  } catch (e) {
    // If not a valid URL, return empty
    return '';
  }
};

/**
 * Sanitize for display in React components
 * Returns sanitized HTML that can be used with dangerouslySetInnerHTML
 * @param {string} dirty - Unsanitized HTML string
 * @returns {object} - Object with __html property for React
 */
export const sanitizeForReact = (dirty) => {
  return {
    __html: sanitizeHTML(dirty)
  };
};

/**
 * Sanitize user bio/description with limited formatting
 * @param {string} dirty - User bio text
 * @returns {string} - Sanitized bio
 */
export const sanitizeBio = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize search query
 * Removes special SQL/NoSQL injection attempts
 * @param {string} query - Search query
 * @returns {string} - Safe search query
 */
export const sanitizeSearchQuery = (query) => {
  if (!query || typeof query !== 'string') return '';

  // Remove HTML first
  const noHTML = sanitizeText(query);

  // Remove common injection patterns
  return noHTML
    .replace(/[<>'"]/g, '') // Remove quotes and brackets
    .replace(/\\/g, '') // Remove backslashes
    .trim()
    .substring(0, 200); // Limit length
};

/**
 * Validate and sanitize email
 * @param {string} email - Email address
 * @returns {string} - Sanitized email or empty string
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';

  const cleaned = sanitizeText(email).toLowerCase().trim();

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(cleaned) ? cleaned : '';
};

/**
 * Validate and sanitize username
 * @param {string} username - Username
 * @returns {string} - Sanitized username
 */
export const sanitizeUsername = (username) => {
  if (!username || typeof username !== 'string') return '';

  // Remove HTML and special chars, allow letters, numbers, underscore, hyphen
  return username
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^a-zA-Z0-9_-]/g, '') // Only alphanumeric, underscore, hyphen
    .trim()
    .substring(0, 30); // Limit length
};

/**
 * Sanitize file name
 * @param {string} filename - File name
 * @returns {string} - Safe file name
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return '';

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/\.{2,}/g, '.') // Prevent directory traversal
    .substring(0, 255); // Limit length
};

/**
 * Sanitize number input
 * @param {any} value - Number value
 * @param {object} options - Options {min, max, decimals}
 * @returns {number} - Safe number
 */
export const sanitizeNumber = (value, options = {}) => {
  const { min = -Infinity, max = Infinity, decimals = 2 } = options;

  const num = parseFloat(value);

  if (isNaN(num)) return 0;

  // Clamp between min and max
  const clamped = Math.min(Math.max(num, min), max);

  // Round to decimals
  return Number(clamped.toFixed(decimals));
};

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeForReact,
  sanitizeBio,
  sanitizeSearchQuery,
  sanitizeEmail,
  sanitizeUsername,
  sanitizeFilename,
  sanitizeNumber,
};
