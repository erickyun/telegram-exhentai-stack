import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  whitelist: Array<number>;
  loading_messages: Array<string>;
  loading_gifs: Array<string>;
  max_files: number;
  max_daily_use:number;

}

const SettingsSchema: Schema = new Schema(
  {
    whitelist: { type: [Number], required: true },
    loading_messages: { type: [String], required: true },
    loading_gifs: { type: [String], required: true },
    max_files: { type: Number, required: true },
    max_daily_use:{ type:Number, required:true },
  },
  { minimize: false },
);

export default mongoose.model('Settings', SettingsSchema);
