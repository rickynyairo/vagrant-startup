import { connect, connection } from "mongoose";
import config from "../config";

export const connectToDatabase = async () => {
  try {
    return connect(`${config.MONGO_DB_URL}`, { useNewUrlParser: true });
  } catch (error) {
    console.log("\ndatabase connection error>>>\n", error);
    process.exit(1);
  }
};

export const database = connection;