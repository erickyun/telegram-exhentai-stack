import { Doujin } from './types.d.ts';
import { Telegraph, upload, parseHtml } from './deps.ts';
import {
    TELEGRAPH_AUTHOR_URL,
    TELEGRAPH_USERNAME,
    LOG_LEVELS,
} from './constants.ts';
import { updateDoujin } from '../backend/doujins.api.ts';
import { TelegraphPostError } from './errors.ts';
import { createLog } from '../backend/logs.api.ts';

/** The telegraph object */
const telegraphPoster = new Telegraph({
    accessToken: Deno.env.get('TELEGRAPH_ACCESS_TOKEN')!,
});
/**
 * Post a doujin to telegraph, update the image urls with the telegraph ones, update the telegraph post url and save the doujin in the db
 * @param doujin Doujin to post
 */
const postDoujin = async (doujin: Doujin) => {
    try {
        let post = '';
        const telegraphImagesUrls = await Promise.all(
            doujin.image_urls.map(async (url) => {
                const file = Deno.openSync(url);
                if (file.statSync().size > 5000000) {
                    file.close();
                    const compressedImage = await Deno.run({
                        cmd: ['convert', url, '-resize', '50%', url],
                        stdout: 'piped',
                        stderr: 'piped',
                    }).status();
                    console.info(LOG_LEVELS.INFO, `Compressing image ${url}`);
                    if (!compressedImage.success) {
                        throw new Error('Error while compressing image');
                    }
                }
                return await upload(url);
            })
        );
        for (let i = 0; i < telegraphImagesUrls.length; i++) {
            post += `<img src="${telegraphImagesUrls[i]}" alt="${doujin.file_name}">`;
            doujin.image_urls[i] = telegraphImagesUrls[i];
        }
        doujin.thumbnail = doujin.image_urls[0];
        const content = parseHtml(post)!;
        const page = await telegraphPoster.create({
            title: doujin.title,
            content: content,
            author_name: TELEGRAPH_USERNAME,
            author_url: TELEGRAPH_AUTHOR_URL,
        });
        doujin.telegraph_url = page.url;
        await updateDoujin(doujin);
    } catch (error) {
        console.error(LOG_LEVELS.ERROR, error);
        createLog(
            LOG_LEVELS.ERROR,
            `Error while posting doujin ${doujin.doujin_id} to telegraph : ${error.message}`
        );
        throw new TelegraphPostError(error.message);
    }
};

export { postDoujin };
