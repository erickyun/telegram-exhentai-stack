import { hostname } from "os";
import app from "./app";
import connectDB from "./libs/db/connectDB";
import settingModel from "./models/setting.model";
import config from "./config/defaults";

const port = config.port;
/**
 * The id of the settings document in the database
 */
export let SETTINGS_ID: string;
export let STATS_ID: string;

app.listen(port, async () => {
  console.log(`Express started listening on port ${port}`);
  connectDB();

  // create settings document if it doesn't exist
  const settings = await settingModel.find();
  if (settings.length === 0) {
    console.log("Creating settings document for the first time.");
    const newSettings = await settingModel.create({
      whitelist: [],
      loading_messages: ["Loading..."],
      loading_gifs: [
        "https://i.kym-cdn.com/photos/images/original/002/366/653/4cc.gif",
      ],
      max_files: 50,
      max_daily_use: 10,
    });
    SETTINGS_ID = newSettings._id as string;
  } else {
    SETTINGS_ID = settings[0]._id as string;
  }

});
