import { API_REQUEST_HEADERS, API_URL } from '../libs/constants.ts';
import { FetchSettingsError } from '../libs/errors.ts';
import { Settings } from '../libs/types.d.ts';

/**
 * Fetch the latest settings from the api
 * @returns Settings object
 */
const getSettings = async (): Promise<Settings> => {
    const res = await fetch(`${API_URL}/settings`, {
        headers: API_REQUEST_HEADERS,
    });
    const settings = await res.json();
    if (res.status != 200) {
        throw new FetchSettingsError('Error fetching settings');
    }
    return settings as Settings;
};

const updateSettings = async (settings: Settings): Promise<void> => {
    const res = await fetch(`${API_URL}/settings/${settings._id}`, {
        method: 'PUT',
        headers: API_REQUEST_HEADERS,
        body: JSON.stringify(settings),
    });
    if (res.status != 200) {
        throw new FetchSettingsError('Error updating settings');
    }
};

export { getSettings, updateSettings };
