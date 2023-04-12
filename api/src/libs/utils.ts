import { InvalidTagFormatError } from "./errors";
import logModel from "../models/log.model";


/**
 * Parse the url of a doujin to get the galleryId, galleryToken and domain
 * @param url The url of the doujin
 * @returns The galleryId, galleryToken and domain of the doujin
 */
export const parseUrl = (
  url: string
): { galleryId: number; galleryToken: string; domain: string } => {
  if (url.endsWith("?nw=always")) {
    url = url.slice(0, -10);
  }
  const urlSplit = url.split("/");
  const galleryId = parseInt(urlSplit[4]);
  const galleryToken = urlSplit[5];
  const domain = urlSplit[2];
  return {  galleryId,  galleryToken,  domain };
};

/**
 * Create a new log
 * @param level The level of the log
 * @param message The message of the log
 */
export const log = async (level: string, message: string) => {
  console.log(`${level} ${message}`);
  const timestamp = new Date().toLocaleString();
  const newLog = new logModel({ level, message, timestamp });
  await newLog.save();
};

/**
 * Validate and parse the tags to be used for the random doujin search
 * @param tags Tags to validate and format
 * @returns the formatted tags both positive and negative, the tags string to be inserted into the url for the search
 * 
 */
export const validateAndParseTags = (
  tags: string
) => {
  // TODO: Refactor this function
  if (!tags.includes("#") && tags != "") {
    throw new InvalidTagFormatError("Invalid tag format", tags);
  }

  const negReg = /\([^)]*\)|\[[^\]]*\]g;/gm; // regex to match negative tags
  const posReg = /^[^\(]+/g; // regex to match positive tags
  const positiveDoujinsMatch = tags.match(posReg)?.toString(); // match positive tags
  const negativeDoujinsMatch = tags.match(negReg)?.toString(); // match negative tags
  
  let negativeTags: string[] = [];
  let positiveTags: string[] = [];
  
  if (negativeDoujinsMatch) {
    negativeTags = negativeDoujinsMatch
      .replace(/\(|\)/g, "") // remove parenthesis
      .split("#"); // split by #
    negativeTags = negativeTags
      .filter((tag) => tag != "") // remove empty tags
      .map((tag) =>  tag.trim()); 
  }
  
  if (positiveDoujinsMatch) {
    positiveTags = positiveDoujinsMatch.split("#"); // split by #
    positiveTags = positiveTags
      .filter((tag) => tag != "")
      .map((tag) =>  tag.trim()); 
  }

  const tagsString = positiveTags
    .map((tag) => {
      tag.replace(/_/g, "+");
      return `+"${tag}"`;
    }) // add + to positive tags
    .concat(
      negativeTags.map((tag) => {
        tag.replace(/_/g, "+");
        return `+-"${tag}"`;
      }) // add - to negative tags
    ) // add - to negative tags and concat to positive tags
    .join("");
  return tagsString;
};

