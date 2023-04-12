import { type ObjectId } from 'https://deno.land/x/mongo@v0.31.1/mod.ts';

/**
 * Represent a user in the collection Users
 */
type User = {
    _id?: ObjectId;
    name: {
        first: string | undefined;
        last: string | undefined;
    };
    user_id: number;
    username: string | undefined;
    doujins: Array<number>;
    favorites: Array<number>;
    usage: number;
    daily_use: number;
    daily_use_date: Date;
    tags: Tags;
};

/**
 * Represent the doujinshi tags in the collection Doujins
 */
type Tags = {
    positive: Record<string, number>;
    negative: Record<string, number>;
};

/**
 * Represent a doujin in the collection Doujins
 */
type Doujin = {
    _id?: ObjectId;
    doujin_id: string;
    rating: string;
    url: string;
    posted: number;
    category: string;
    title: string;
    file_count: number;
    file_name: string;
    image_urls: Array<string>;
    thumbnail: string;
    telegraph_url: string;
    tags: Array<string>;
};

/**
 * Represent the whitelist file for whitelisted users ( no daily limits )
 */
type Whitelist = {
    whitelisted_users: Array<number>;
};
/**
 * Represent the settings for the bot.
 */
export type Settings = {
    _id?: string;
    whitelist: Array<number>;
    loading_messages: Array<string>;
    max_files: number;
    max_daily_use: number;
    loading_gifs: Array<string>;
};

type Log = {
    _id?: ObjectId;
    level: string;
    message: string;
    timestamp: string;
};

export type ApiError = {
    message: string;
    error: {
        caption: string;
        name: string;
        tags?: string;
        message?: string;
    };
};

export type { Doujin, User, Tags, Whitelist, Log };
