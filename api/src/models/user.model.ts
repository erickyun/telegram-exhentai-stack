import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name:{
    first:string | undefined;
    last:string | undefined;
  }
  user_id: number;
  username: string;
  doujins: number[];
  favorites: number[];
  usage: number;
  daily_use: number;
  daily_use_date: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      first: { type: String, required: false },
      last: { type: String, required: false },
    },
    user_id: { type: Number, required: true, unique: true },
    username: { type: String, required: false },
    doujins: { type: [Number], required: false },
    favorites: { type: [Number], required: false },
    usage: { type: Number, required: true, default: 0 },
    daily_use: { type: Number, required: true, default: 0 },
    daily_use_date: {
      type: Date,
      required: true,
      default: new Date().toDateString(),
    }
  },
  { minimize: false },
);

export default mongoose.model<IUser>('User', UserSchema);
