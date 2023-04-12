import HTMLParser from "node-html-parser";
import { log, parseUrl } from "../utils";
import doujin_exhentaiModel from "../../models/doujin_exhentai.model";
import { Doujin, EhentaiApiResponse, MetadataDoujin } from "../types";
import {
  DOUJIN_GALLERY_REGEX,
  EXHENTAI_HEADERS,
  GALLERY_URL_REGEX,
  LOG_LEVELS,
} from "../constants";
import {
  BadImageUrlError,
  BadRequestError,
  GalleryUrlsFetchError,
  NoDoujinFoundError,
  NoResultsError,
} from "../errors";
import settingModel from "../../models/setting.model";
import { SETTINGS_ID } from "../..";

/**
 * Get the metadata of a doujin from exhentai or e-hentai
 * @param galleryId : id of the galery
 * @param galleryToken : token of the galery
 * @param domain : domain of the galery
 * @returns metadata of the doujin
 */
const getMetadata = async (
  galleryId: number,
  galleryToken: string,
  domain: string
) => {
  const response: EhentaiApiResponse = await fetch(
    `https://${domain}/api.php`,
    {
      method: "POST",
      headers: EXHENTAI_HEADERS,
      body: JSON.stringify({
        method: "gdata",
        gidlist: [[galleryId, galleryToken]],
        namespace: 1,
      }),
    }
  )
    .then((res) => res.json())
    .catch(async () => {
      await log(
        LOG_LEVELS.ERROR,
        `(API) Error while fetching metadata: ${galleryId}`
      );
    });

  if (response.error) {
    log(LOG_LEVELS.ERROR, `(API) Error while fetching metadata: ${galleryId}`);
    throw new BadRequestError(response.error);
  } else if (response.gmetadata[0].error) {
    log(LOG_LEVELS.WARN, `(API) Error no results for: ${galleryId}`);
    throw new NoResultsError(response.gmetadata[0].error);
  }
  return response.gmetadata[0] as MetadataDoujin;
};

/**
 * Get the urls of all the pages of a doujin
 * @param url : url of the doujin
 * @param fileCount : number of files of the doujin
 * @returns The urls of the pages of the doujin
 */
const getPageUrls = async (
  url: string,
  filecount: number,
  max_files: number
): Promise<string[]> => {
  let pageCount = Math.floor(filecount / 20);

  if (filecount % 20 != 0) {
    pageCount += 1;
  }
  if (filecount > max_files) {
    pageCount = max_files / 20;
  }
  const pageUrls = [];
  for (let i = 0; i < pageCount; i++) {
    pageUrls.push(`${url}?p=${i}`);
  }
  return pageUrls;
};

/**
 * Get all the gallery urls of a page for a doujin
 * @param url : url of the doujin
 * @returns The urls of the gallery pages for the given doujin
 */
const getGalleryUrls = async (url: string) => {
  const html = await fetch(url, { headers: EXHENTAI_HEADERS }).then((res) =>
    res.text()
  );
  const root = HTMLParser.parse(html);

  if (root) {
    return root
      .getElementsByTagName("a")
      .map((a) => a.getAttribute("href"))
      .filter((href) => {
        if (href) {
          return GALLERY_URL_REGEX.test(href);
        }
        return false;
      });
  }
  log(LOG_LEVELS.ERROR, `(API) Failed to fetch gallery urls for : ${url}`);
  throw new GalleryUrlsFetchError("Failed to fetch gallery urls");
};

/**
 * Get an individual image url from a galery url
 * @param url : url of the doujin
 * @returns The image url of the given gallery url
 */
const getImageUrl = async (url: string) => {
  const html = await fetch(url, { headers: EXHENTAI_HEADERS }).then((res) =>
    res.text()
  );
  const root = HTMLParser.parse(html);
  const imageUrl = root.getElementById("img")?.getAttribute("src") ?? "";

  if (imageUrl == "") {
    throw new BadImageUrlError("No image url found");
  }
  return imageUrl;
};

/**
 * Get all the image urls of a doujin.
 * @param url The url of the doujin
 * @param filecount The number of files in the doujin
 * @returns The urls of the images
 */
const getImageUrls = async (
  doujinUrl: string,
  filecount: number
): Promise<string[]> => {
  const settings = await settingModel.findById(SETTINGS_ID);

  if (settings) {
    const pageUrls = await getPageUrls(
      doujinUrl,
      filecount,
      settings.max_files
    );
    const imageUrls: string[] = [];

    try {
      const galleryUrls: string[] = [];
      for (const pageUrl of pageUrls) {
        const urls = await getGalleryUrls(pageUrl);
        for (const url of urls) {
          if (!galleryUrls.includes(url!)) {
            galleryUrls.push(url!);
          }
        }
      }
      let numUrls =
        filecount > settings.max_files ? settings.max_files : filecount;
      for (let i = 0; i < numUrls; i++) {
        const imageUrl = await getImageUrl(galleryUrls[i]);
        imageUrls.push(imageUrl);
      }
      return imageUrls;
    } catch (error: any) {
      if (error instanceof BadImageUrlError) {
        log(LOG_LEVELS.ERROR, `(API) Bad image url for : ${doujinUrl}`);
        throw new BadImageUrlError(error.message);
      } else {
        log(
          LOG_LEVELS.ERROR,
          `(API) Failed to fetch image urls for : ${doujinUrl}`
        );
        throw new Error(error.message);
      }
    }
  }
  throw new Error("Settings not found");
};

/**
 * Get the page range to search for a random doujin
 * @param url : The exhentai url with the tags
 * @returns The first doujin ID to be used when determining the page limit (0 - first doujin id found)
 */
const getPageLimit = async (url: string): Promise<string> => {
  const html = await fetch(url, { headers: EXHENTAI_HEADERS }).then((res) =>
    res.text()
  );
  const doc = HTMLParser.parse(html);
  if (doc != null) {
    let firstDoujinUrl = "";
    const allUrls = doc.getElementsByTagName("a");

    for (let i = 0; i < allUrls.length; i++) {
      const href = allUrls[i].getAttribute("href");
      if (href != undefined && DOUJIN_GALLERY_REGEX.test(href)) {
        firstDoujinUrl = href;
        break;
      }
    }
    if (firstDoujinUrl != "") {
      return firstDoujinUrl.split("/")[4];
    }
    log(LOG_LEVELS.WARN, `(API) No doujins found for url : ${url}`);
    throw new NoDoujinFoundError("No doujins found", "");
  }
  throw new Error("Failed to get page limit");
};

/**
 * TODO: Avoid duplicates by checking if the doujin already exists in the database, Send a message with the number of doujins found for the given tags.
 *  Get a random doujin from the given tags
 * @param tags : tags to search for
 * @returns A random doujin from the given tags
 */
const getRandomDoujin = async (tags: string): Promise<string> => {
  const settings = await settingModel.findById(SETTINGS_ID);
  if (settings) {
    try {
      let searchUrl = `https://exhentai.org/?f_search=language:english${tags}&advsearch=1&f_srdd=4&f_spf=1&f_spt=${settings.max_files}`;
      const pageLimit = await getPageLimit(searchUrl);
      const randomPageNumber = Math.floor(Math.random() * parseInt(pageLimit));
      searchUrl += `&prev=${randomPageNumber}`;
      const randomDoujins = await fetch(searchUrl, {
        headers: EXHENTAI_HEADERS,
      }).then((res) => res.text());

      const doc = HTMLParser.parse(randomDoujins);
      if (doc != null) {
        const doujinUrls = doc.getElementsByTagName("a");
        let randomDoujinUrl = "";
        while (randomDoujinUrl == "") {
          const randomDoujin =
            doujinUrls[Math.floor(Math.random() * doujinUrls.length)];
          const href = randomDoujin.getAttribute("href");
          if (href != null && DOUJIN_GALLERY_REGEX.test(href)) {
            randomDoujinUrl = href;
          }
        }
        return randomDoujinUrl;
      }
      throw new NoDoujinFoundError("No doujin found", tags);
    } catch (err: any) {
      if (err instanceof NoDoujinFoundError) {
        log(LOG_LEVELS.WARN, `(API) No doujin found for tags : ${tags}`);
        throw new NoDoujinFoundError(err.message, tags);
      } else {
        log(
          LOG_LEVELS.ERROR,
          `(API) Failed to get random doujin for tags : ${tags}`
        );
        throw new Error(err.message);
      }
    }
  }
  throw new Error("Settings not found");
};

/**
 * Construct the doujin object from the metadata.
 * @param metadata The metadata of the doujin
 * @param url The url of the doujin
 * @returns The doujin object
 */
const constructDoujin = async (metadata: MetadataDoujin, url: string) => {
  const tagsArray = metadata.tags.map((tag) => {
    const parts = tag.split(":");
    const tagValue = parts.length > 1 ? parts[1] : parts[0];
    return "#" + tagValue.replace(/[\s-]+/g, "_");
  });

  const imageUrls = await getImageUrls(url, parseInt(metadata.filecount));

  return {
    doujin_id: metadata.gid.toString(),
    rating: metadata.rating,
    url: url,
    file_name: metadata.title
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "_"),
    posted: parseInt(metadata.posted),
    category: metadata.category.replace(/\s+/g, ""),
    title: metadata.title,
    file_count: parseInt(metadata.filecount),
    tags: tagsArray,
    image_urls: imageUrls,
    thumbnail: metadata.thumb,
    telegraph_url: "none",
  } as Doujin;
};

const getDoujin = async (url: string) => {
  const { domain, galleryId, galleryToken } = parseUrl(url);
  const doujinExists = await doujin_exhentaiModel.findOne({
    doujin_id: galleryId.toString(),
  });

  if (doujinExists != null) return doujinExists;
  const metadata = await getMetadata(galleryId, galleryToken, domain);
  const doujin = await constructDoujin(metadata, url);
  const savedDoujin = await (await doujin_exhentaiModel.create(doujin)).save();
  return savedDoujin;
};

export { getDoujin, getRandomDoujin };
