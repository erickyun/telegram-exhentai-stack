import { Doujin } from './types.d.ts';
import {
    LOG_LEVELS,
    TELEGRAPH_AUTHOR_URL,
    TELEGRAPH_USERNAME,
    LOG_LEVELS_API,
} from './constants.ts';
import {
    compress,
    Destination,
    download,
    DownlodedFile,
    exec,
} from './deps.ts';
import { ImageDownloadError, ZipError } from './errors.ts';
import { postDoujin } from './telegraph.ts';
import { createFolder } from './utils.ts';
import { createLog } from '../backend/logs.api.ts';

/**
 * Prepare the doujin to be sent by downloading all the images and posting the doujin to Telegraph
 * @param doujin : doujin be prepared to be sent to the user
 */
const doujinPostingPrep = async (doujin: Doujin): Promise<void> => {
    await downloadImages(doujin);
    await postDoujin(doujin);
};

/**
 * Returns a string reprensenting the doujin for a message
 * @param doujin : Doujin
 * @returns The string for the message
 */
const doujinMessage = (doujin: Doujin): string => {
    const postedDate = new Date(doujin.posted * 1000).toLocaleDateString(
        'en-US'
    );
    return (
        `<strong>Title :</strong> \n<a href="${doujin.telegraph_url}">${doujin.title}</a>` +
        `\n<strong>Category :</strong> \n#${doujin.category}\n` +
        `<strong>Posted :</strong> \n${postedDate}\n` +
        `<strong>Pages :</strong> \n${doujin.file_count}\n` +
        `<strong>Rating :</strong> \n${doujin.rating} 🌟\n` +
        `<strong>Tags :</strong> \n${doujin.tags.join(' ')}\n` +
        `<strong>Link :</strong> \n<a href="${doujin.url}">Exhentai</a>\n` +
        `<strong>Channel :</strong> \n<a href="${TELEGRAPH_AUTHOR_URL}">${TELEGRAPH_USERNAME}</a>`
    );
};

/**
 * Zip the doujin and return the path to the zip file
 *
 * @param doujin : Doujin to be zipped
 * @returns The path to the zip file
 */
const zipDoujin = async (doujin: Doujin): Promise<string> => {
    try {
        await downloadImages(doujin);
        // log cwd
        const doujinInfo = doujinDescriptionFile(doujin);
        await Deno.writeTextFile(
            `images/${doujin.doujin_id}/doujin.txt`,
            doujinInfo
        );
        const files = [
            `images/${doujin.doujin_id}/doujin.txt`,
            ...doujin.image_urls,
        ];
        await compress(files, `images/${doujin.doujin_id}.zip`);
        return `images/${doujin.doujin_id}.zip`;
    } catch (err) {
        await createLog(
            LOG_LEVELS_API.ERROR,
            `Error while zipping doujin ${doujin.doujin_id} : ${err.message}`
        );
        throw new ZipError(err.message, doujin.doujin_id);
    }
};

/**
 *  Get the doujin description file content
 * @param doujin : Doujin for wich the description file will be created
 * @returns  The description file content
 */
const doujinDescriptionFile = (doujin: Doujin): string => {
    const postedDate = new Date(doujin.posted * 1000).toLocaleDateString(
        'en-US'
    );
    return (
        `Title : ${doujin.title}\n` +
        `Category : #${doujin.category}\n` +
        `Posted : ${postedDate}\n` +
        `Pages : ${doujin.file_count}\n` +
        `Rating : ${doujin.rating} 🌟\n` +
        `Tags : ${doujin.tags.join(' ')}\n` +
        `Link : ${doujin.url}\n` +
        `Channel : ${TELEGRAPH_AUTHOR_URL}`
    );
};

/**
 * Download all the images of a doujin
 * @param doujin : doujin to download the images from
 */
const downloadImages = async (doujin: Doujin): Promise<void> => {
    await createFolder(doujin.doujin_id);
    // use Promise.all to download all images at the same time
    const downloadFiles = await Promise.all(
        doujin.image_urls.map(async (url, index) => {
            return await downloadImage(url, index, doujin.doujin_id);
        })
    ).catch((error) => {
        console.error(`${LOG_LEVELS.ERROR} ${error.name}: ${error.message}`);
        createLog(
            LOG_LEVELS_API.ERROR,
            `Error while downloading doujin ${doujin.doujin_id} : ${error.message}`
        );
        throw new ImageDownloadError(error.message);
    });
    doujin.image_urls = downloadFiles.map((file) => file.fullPath);
};

/**
 * Download an image from a url from a doujin
 * @warning Sometimes the P2P image url will throw an SSL error, so we use wget to download the image as a fallback
 * @param url : url of the image to download
 * @param index : index of the image in the doujin
 * @param doujinId : id of the doujin
 * @returns The path of the downloaded image
 */
const downloadImage = async (
    url: string,
    index: number,
    doujinId: string
): Promise<DownlodedFile> => {
    const fileExtension = url.split('.').pop();
    try {
        const destination: Destination = {
            file: `${index}.${fileExtension}`,
            dir: `images/${doujinId}`,
        };
        const file = await download(url, destination);
        return file;
    } catch (_error) {
        console.warn(
            `${LOG_LEVELS.WARN} Error downloading ${index}.${fileExtension}`
        );
        console.info(`${LOG_LEVELS.INFO} Retrying download... with WGET`);
        await exec(
            `wget -O images/${doujinId}/${index}.${fileExtension} ${url}`
        );
        const file: DownlodedFile = {
            fullPath: `images/${doujinId}/${index}.${fileExtension}`,
            file: `${index}.${fileExtension}`,
            dir: `images/${doujinId}`,
            size: 0,
        };
        return file;
    }
};

export { doujinMessage, doujinPostingPrep, zipDoujin };
