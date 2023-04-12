import {
    API_REQUEST_HEADERS,
    API_URL,
    LOG_LEVELS,
    LOG_LEVELS_API,
} from '../libs/constants.ts';
import type { User } from '../libs/types.d.ts';
import {
    UserCreationError,
    UserDeleteError,
    UserNotFoundError,
    UserUpdateError,
} from '../libs/errors.ts';
import { getSettings } from './settings.api.ts';

/**
 * Get user from the Users collection in the db
 * @param id : user id
 * @returns : User object
 */
const getUser = async (id: number): Promise<User> => {
    if (id === undefined) throw new UserNotFoundError('User not found', 0);
    const res = await fetch(`${API_URL}/users/${id}`, {
        headers: API_REQUEST_HEADERS,
    });
    const user = await res.json();
    if (user == null) {
        console.error(LOG_LEVELS.ERROR, 'User not found');
        throw new UserNotFoundError('User not found', id);
    }
    return user;
};

/**
 * Insert a new user in the Users collection in the db
 * @param id : user id
 * @param username : username
 */
const newUser = async (
    id: number,
    username?: string,
    firstName?: string,
    lastName?: string
): Promise<void> => {
    if (id === undefined) throw new UserNotFoundError('User not found', 0);
    const user = await userExists(id);
    if (!user) {
        const today = new Date(Date.now());
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: API_REQUEST_HEADERS,
            body: JSON.stringify({
                name: {
                    first: firstName,
                    last: lastName,
                },
                user_id: id,
                username: username,
                doujins: [],
                favorites: [],
                Usage: 0,
                daily_use: 0,
                daily_use_date: today,
                tags: {
                    positive: {},
                    negative: {},
                },
            }),
        });

        if (res.status != 200) {
            console.error(LOG_LEVELS.ERROR, 'Error while creating user');
            throw new UserCreationError('Error while creating user');
        }
    }
};

const deleteUser = async (id: number): Promise<void> => {
    if (id === undefined) throw new UserNotFoundError('User not found', 0);
    const user = await getUser(id);
    const res = await fetch(`${API_URL}/users/${user._id}`, {
        method: 'DELETE',
        headers: API_REQUEST_HEADERS,
    });
    if (res.status != 204) {
        console.error(LOG_LEVELS.ERROR, 'Error while deleting user');
        throw new UserDeleteError('Error while deleting user', id);
    }
};

/**
 * Update the usage count of the user
 * @param id : user id
 */
const updateTotalUsage = async (id: number): Promise<void> => {
    if (id === undefined) throw new UserNotFoundError('User not found', 0);
    const user = await getUser(id);
    user.usage++;
    await updateUser(user);
};

/**
 * Update the daily usage of the user unless whitelisted
 * @param id : user id
 */
const updateDailyUsage = async (id: number): Promise<void> => {
    if (id === undefined) throw new UserNotFoundError('User not found', 0);
    const user = await getUser(id);
    const daily_use_date = new Date(user.daily_use_date);
    const today = new Date(Date.now());

    if (daily_use_date.toLocaleDateString() == today.toLocaleDateString()) {
        user.daily_use++;
    } else {
        user.daily_use = 1;
        user.daily_use_date = today;
    }
    user.usage++;
    await updateUser(user);
};

/**
 *
 * @param id : user id
 * @returns daily usage and date of the user
 */
const getDailyUsage = async (
    id: number
): Promise<{ dailyUse: number; dailyUseDate: Date }> => {
    if (id === undefined) throw new UserNotFoundError('User not found', 0);
    const user = await getUser(id);
    const { daily_use, daily_use_date } = user!;
    return { dailyUse: daily_use, dailyUseDate: new Date(daily_use_date) };
};

/**
 * Checks the daily usage of the user
 * @param id user id
 * @returns True if the daily usage is reached, false otherwise
 */
const checkDailyUsage = async (id: number): Promise<boolean> => {
    if (id === undefined) throw new UserNotFoundError('User not found', id);
    const { dailyUse, dailyUseDate } = await getDailyUsage(id);
    const { whitelist, max_daily_use } = await getSettings();
    const today = new Date(Date.now());
    if (whitelist.includes(id)) {
        return false;
    }
    if (
        dailyUseDate.toLocaleDateString() == today.toLocaleDateString() &&
        dailyUse >= max_daily_use
    ) {
        return true;
    }
    return false;
};

/**
 * Add a doujin to the user's doujins
 * @param id : user id
 * @param doujinId : doujin id
 */
const addDoujin = async (user_id: number, doujinId: number): Promise<void> => {
    if (user_id === undefined) throw new UserNotFoundError('User not found', 0);
    const user = await getUser(user_id);
    user.doujins.push(doujinId);
    await updateUser(user);
};

/**
 * Update the user
 * @param user : user object
 */
const updateUser = async (user: User): Promise<void> => {
    if (user === undefined) throw new UserNotFoundError('User not found', 0);

    const res = await fetch(`${API_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: API_REQUEST_HEADERS,
        body: JSON.stringify(user),
    });
    if (res.status != 200) {
        console.error(LOG_LEVELS.ERROR, 'Error while updating user');
        throw new UserUpdateError('Error while updating user', user.user_id);
    }
};

/**
 * Check if the user exists
 * @param id : user id
 * @returns A boolean indicating if the user exists
 */
const userExists = async (id: number): Promise<boolean> => {
    if (id === undefined) throw new UserNotFoundError('User not found', 0);
    const res = await fetch(`${API_URL}/users/exists/${id}`, {
        headers: API_REQUEST_HEADERS,
    });
    const user_id = await res.json();
    return user_id != null;
};

export {
    getUser,
    newUser,
    userExists,
    updateTotalUsage,
    updateDailyUsage,
    getDailyUsage,
    checkDailyUsage,
    deleteUser,
    addDoujin,
};
