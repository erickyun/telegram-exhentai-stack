import mongoose, { Schema, Document } from 'mongoose';

export interface IDoujinExhentai extends Document {
  doujin_id: string;
  rating: string;
  url: string;
  file_name: string;
  posted: number;
  image_urls: Array<string>;
  category: string;
  title: string;
  file_count: number;
  tags: Array<string>;
  thumbnail: string;
  telegraph_url: string;
}

const DoujinExhentaiSchema: Schema = new Schema(
  {
    doujin_id: { type: String, required: true, unique: true },
    rating: { type: String, required: true },
    url: { type: String, required: true },
    file_name: { type: String, required: true },
    image_urls: { type: [String], required: true },
    posted: { type: Number, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    file_count: { type: Number, required: true },
    tags: { type: [String], required: true },
    thumbnail: { type: String, required: true },
    telegraph_url: { type: String, required: true },
  },
);


export default mongoose.model<IDoujinExhentai>('Exhentai_Doujin', DoujinExhentaiSchema);