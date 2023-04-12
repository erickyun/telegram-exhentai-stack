
/** 
 * The body of the request for metadata 
 */
export type MetadataBody = {
  method: string,
  gidlist: Array<[number, string]>
  namespace: number
}
/**
 * The metadata of a doujin
 */
export type MetadataDoujin = {
  gid: number,
  token: string,
  archiver_key: string,
  title: string,
  title_jpn: string,
  category: string,
  thumb: string,
  posted: string,
  uploader: string,
  filecount: string,
  filesize: number,
  expunged: boolean,
  rating: string,
  torrentcount: string,
  torrents?: Array<Torrent>,
  tags: Array<string>
  parent_gid?: string,
  parent_key?: string,
  current_gid?: string,
  current_key?: string,
  first_gid?: string,
  first_key?: string,
  error?: string
}
/** 
 * The response of the e-hentai/exhentai API
*/
export type EhentaiApiResponse = {
  error?: string,
  gmetadata: Array<MetadataDoujin>
}
/** 
 * The torrents of the doujin
 */
type Torrent = {
  hash?: string,
  added?: string,
  name?: string,
  tsize?: string,
  fsize?: string
}

/**
 * Doujin type for the database
 */
export type Doujin ={
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
}
