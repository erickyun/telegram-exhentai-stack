import { E_HENTAI_DOMAIN, EXHENTAI_DOMAIN, LOG_LEVELS } from './constants.ts';
import { InvalidTagFormatError } from './errors.ts';

/**
 * Validate if a string is a valid exhentai/e-hentai url
 * @param url The exhentai/e-hentai url
 * @returns True if the url is valid, false otherwise
 */
export const verifyUrl = (url: string): boolean => {
    if (!(url == '')) {
        if (
            url.startsWith(EXHENTAI_DOMAIN) ||
            url.startsWith(E_HENTAI_DOMAIN)
        ) {
            return true;
        }
    }
    return false;
};
/**
 * Cleanup the workdir
 */
export const cleanupWorkdir = async (): Promise<void> => {
    try {
        await Deno.remove('images', { recursive: true });
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            console.info(LOG_LEVELS.INFO, 'Workdir not found, no cleanup');
        } else {
            console.error(LOG_LEVELS.ERROR, error);
        }
    }
};
/**
 * Create the folder for the doujin images.
 * @param folderName the name of the folder to create
 */
export const createFolder = async (folderName: string): Promise<void> => {
    try {
        await Deno.mkdir(`images/${folderName}`, { recursive: true });
    } catch (err) {
        console.error(`${LOG_LEVELS.ERROR} ${err.name}: ${err.message}`);
    }
};

/**
 * Validate and parse the tags to be used for the random doujin search
 * @param tags Tags to validate and format
 * @returns the formatted tags both positive and negative, the tags string to be inserted into the url for the search
 */
export const validateTags = (tags: string): void => {
    if (!tags.includes('#') && tags != '') {
        throw new InvalidTagFormatError('Invalid tag format', tags);
    }
};

/**
 * Parse the url to get the gallery id, gallery token and domain
 * @param url The exhentai/e-hentai url
 * @returns  The gallery id, gallery token and domain
 */
export const parseUrl = (
    url: string
): { galeryId: number; galeryToken: string; domain: string } => {
    // remove  trailing ?nw=always
    if (url.endsWith('?nw=always')) {
        url = url.slice(0, -10);
    }
    const urlSplit = url.split('/');
    const galeryId = parseInt(urlSplit[4]);
    const galeryToken = urlSplit[5];
    const domain = urlSplit[2];
    return { galeryId: galeryId, galeryToken: galeryToken, domain: domain };
};
