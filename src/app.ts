#!/usr/bin/env nodejs
import http from "http";
import express from "express";
import { applyMiddleware, applyRoutes } from "./utils";
import authRoutes from "./auth/routes";
import postRoutes from "./posts/routes";
import commonMiddleware from "./middleware";
import errorHandlers from "./middleware/errorHandlers";
import { validateEnv } from "./utils/validateEnv";
import { connectToDatabase } from "./services/database";
import config from "./config";
import {
  passportLoginStrategy,
  passportJwtStrategy
} from "./auth";

process.on("uncaughtException", (e) => {
  console.log(e);
  process.exit(1);
});

process.on("unhandledRejection", (e) => {
  console.log(e);
  process.exit(1);
});

const app = express();

validateEnv();

applyMiddleware(commonMiddleware, app);
applyRoutes(authRoutes, app);
applyRoutes(postRoutes, app);
applyMiddleware(errorHandlers, app);

connectToDatabase();
passportLoginStrategy();
passportJwtStrategy();

const PORT = config.PORT;
const server = http.createServer(app);

server.listen(PORT, () =>
  console.log(`Server is running http://localhost:${PORT}...`)
);

export default app;