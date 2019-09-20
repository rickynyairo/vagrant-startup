import {
    cleanEnv, str, port
  } from "envalid";

import config from "../config";

export const validateEnv = () => {
  cleanEnv(config, {
    NODE_ENV: str(),
    MONGO_DB_URL: str(),
    PORT: port(),
    SESSION_SECRET: str(),
  });
};
