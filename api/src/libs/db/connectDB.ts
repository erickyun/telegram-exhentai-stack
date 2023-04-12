import mongoose from "mongoose";
import config from "../../config/defaults";

const connectionUri = config.dbUri;

const connectDB = async () => {
  try {
    await mongoose.connect(connectionUri);
    console.log("MongoDB connected");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
