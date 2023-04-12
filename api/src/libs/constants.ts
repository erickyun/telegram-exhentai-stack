import path from 'path';
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Regex to match exhentai gallery urls.
 */
const DOUJIN_GALLERY_REGEX = /https:\/\/(exhentai)\.org\/g\/\d+\/\w+\/?/;

/**
 * Headers to use when fetching exhentai pages.
 */
const EXHENTAI_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
  'Cookie': process.env.EXHENTAI_COOKIE || '',
};

/**
 * Regex to match exhentai gallery urls.
 */
const GALLERY_URL_REGEX = /https:\/\/(exhentai|e-hentai)\.org\/s\//;

/**
 * The log levels.
 */
const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

export { LOG_LEVELS, EXHENTAI_HEADERS, DOUJIN_GALLERY_REGEX, GALLERY_URL_REGEX };