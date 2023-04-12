import path from "path";
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const config: { port: number; dbUri: string } = {
  port: 8000,
  dbUri:
    process.env.NODE_ENV === "production"
      ? process.env.MONGO_URI_PROD || ""
      : process.env.MONGO_URI_DEV || "",
};
export default config;
