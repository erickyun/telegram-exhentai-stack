import mongoose, { Schema, Document } from 'mongoose';

type Level = 'info' | 'warn' | 'error' | 'debug';


export interface ILog extends Document {
  level: Level;
  message: string;
  timestamp: Date;
}

const LogSchema: Schema = new Schema(
  {
    level: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { minimize: false },
);

export default mongoose.model<ILog>('Log', LogSchema);