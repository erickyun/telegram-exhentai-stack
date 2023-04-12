import 'https://deno.land/std@0.181.0/dotenv/load.ts';

export const API_URL = Deno.env.get('API_BASE_URL')!;

/**
 * Logging levels
 */
export const LOG_LEVELS = {
    DEBUG: '[DEBUG] - ',
    INFO: '[INFO] - ',
    WARN: '[WARN] - ',
    ERROR: '[ERROR] - ',
    FATAL: '[FATAL] - ',
};

/**
 * Logging levels
 */
export const LOG_LEVELS_API = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
};

export const VERSION = '2.0.0';

/**
 * Headers to use when using the internal api.
 */
export const API_REQUEST_HEADERS = {
    'x-api-key': Deno.env.get('API_KEY')!,
    'Content-Type': 'application/json',
};

/**
 * Gif to send when the user reached the daily limit.
 */
export const DAILY_LIMIT_REACHED_GIF =
    'https://steamuserimages-a.akamaihd.net/ugc/937195788583559983/AB9FC13C4615DB070CBB80F6F71EF09C9B8E0AC6/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';
/**
 * Gif to send when the bot has an error.
 */
export const ERROR_GIF =
    'https://media.tenor.com/TyV5H3JCz1MAAAAC/kanna-cry.gif';

/**
 * Telegraph username for the posts.
 */
export const TELEGRAPH_USERNAME =
    Deno.env.get('TELEGRAPH_USERNAME') || 'ExHentaiBot';
/**
 * Telegraph author url.
 */
export const TELEGRAPH_AUTHOR_URL = Deno.env.get('TELEGRAPH_AUTHOR_URL') || '';

/**
 * Exhentai base url.
 */
export const EXHENTAI_DOMAIN = 'https://exhentai.org/';
/**
 * E-hentai base url.
 */
export const E_HENTAI_DOMAIN = 'https://e-hentai.org/';

export const OWNER_ID = Deno.env.get('OWNER_ID') || '0'