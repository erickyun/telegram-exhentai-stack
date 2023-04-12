import {
    API_REQUEST_HEADERS,
    API_URL,
    LOG_LEVELS,
    LOG_LEVELS_API,
} from '../libs/constants.ts';
import type { ApiError, Doujin } from '../libs/types.d.ts';
import {
    BadRequestError,
    DoujinDatabaseSaveError,
    NoDoujinFoundError,
    NoResultsError,
} from '../libs/errors.ts';

/**
 * Get doujin by id
 * @param {number} id - Doujin id
 * @returns A doujin if found or undefined if not found
 */
const getDoujin = async (id: string): Promise<Doujin | undefined> => {
    const res = await fetch(`${API_URL}/doujins/exhentai/${id}`, {
        headers: API_REQUEST_HEADERS,
    });
    const doujin = await res.json();
    if (doujin == null) {
        console.error(LOG_LEVELS.WARN, 'Doujin not found');
        return undefined;
    }
    return doujin as Doujin;
};

/**
 * Get random doujin by tags (optional)
 * @param tags - Tags to search for
 * @returns A doujin if found
 */
const getRandDoujin = async (tags?: string) => {
    const query = tags ? { tags: tags } : {};

    const res = await fetch(`${API_URL}/doujins/exhentai/random`, {
        headers: API_REQUEST_HEADERS,
        method: 'POST',
        body: JSON.stringify(query),
    });
    if (res.status != 200) {
        console.error(LOG_LEVELS.ERROR, 'Error while getting random doujin');
        const err = (await res.json()) as ApiError;
        if (err.error.name == 'NoDoujinFoundError') {
            throw new NoDoujinFoundError(err.error.caption!, err.error.tags!);
        } else {
            throw new Error(err.error.caption!);
        }
    }
    const doujin_url = await res.json();
    return doujin_url as string;
};
/**
 * Get new doujin by url
 * @param url the url of the doujin to get
 * @returns the doujin object
 */
const getNewDoujin = async (url: string) => {
    const res = await fetch(`${API_URL}/doujins/exhentai/get`, {
        headers: API_REQUEST_HEADERS,
        method: 'POST',
        body: JSON.stringify({ url: url }),
    });
    if (res.status != 200) {
        console.error(LOG_LEVELS.ERROR, 'Error while getting new doujin');
        const err = (await res.json()) as ApiError;
        if (err.error.name == 'NoResultsError') {
            throw new NoResultsError(err.error.caption!);
        } else if (err.error.name == 'BadRequestError') {
            throw new BadRequestError(err.error.caption!);
        } else {
            throw new Error(err.error.caption!);
        }
    }
    const doujin = await res.json();
    return doujin as Doujin;
};
/**
 * Update a doujin in the db
 * @param doujin - Doujin to update
 */
const updateDoujin = async (doujin: Doujin): Promise<void> => {
    const res = await fetch(`${API_URL}/doujins/exhentai/${doujin._id}`, {
        method: 'PUT',
        headers: API_REQUEST_HEADERS,
        body: JSON.stringify(doujin),
    });
    if (res.status != 200) {
        console.error(LOG_LEVELS.ERROR, 'Error while updating doujin');
        throw new DoujinDatabaseSaveError(
            'Error while saving doujin to database',
            doujin.doujin_id
        );
    }
};

export { getDoujin, getNewDoujin, updateDoujin, getRandDoujin };
