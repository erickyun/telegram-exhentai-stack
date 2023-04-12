import { API_REQUEST_HEADERS, API_URL, LOG_LEVELS } from '../libs/constants.ts';
import { Log } from '../libs/types.d.ts';

const createLog = async (level: string, message: string): Promise<void> => {
    const timestamp = new Date().toLocaleString();
    const log: Log = {
        level: level,
        message: message,
        timestamp: timestamp,
    };

    const res = await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: API_REQUEST_HEADERS,
        body: JSON.stringify(log),
    });
    if (res.status != 200) {
        console.log(await res.json());
        console.error(LOG_LEVELS.ERROR, 'Error while creating log');
    }
};

export { createLog };
