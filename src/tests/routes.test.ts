import { createServer } from "http";
import express from "express";
import supertest from "supertest";
import { applyMiddleware, applyRoutes } from "../utils";
// import requestPromise from "request-promise";
import middleware, { testingMiddleware } from "../middleware";
import errorHandlers from "../middleware/errorHandlers";
import authRoutes from "../auth/routes";
import postRoutes from "../posts/routes";
import { connectToDatabase, database } from "../services/database";
import config from "../config"
import {
  passportLoginStrategy,
  passportJwtStrategy
} from "../auth";

// import app from "../app";

// jest.mock("request-promise");
// (requestPromise as any).mockImplementation(() => '{"features": []}');

describe("routes", () => {
  let app: any, server: any, db: any;
  let user1Token: any;
  let user2Token: any;
  beforeAll(async () => {
    const user1 = {
      username: "testuser",
      password: "testpassword",
      address: {
        city: "Nairobi",
        street: "Roysambu"
      }
    }
    app = express();
    // applyMiddleware(middleware, app);
    applyMiddleware(testingMiddleware, app);
    applyRoutes(authRoutes, app);
    applyRoutes(postRoutes, app);
    applyMiddleware(errorHandlers, app);

    connectToDatabase();
    passportLoginStrategy();
    passportJwtStrategy();
    server = createServer(app).listen(config.PORT);
    // create test user
    const response = await supertest(app)
      .post("/api/signup/")
      .send(user1);
    expect(response.status).toEqual(201);
    expect(response.body.token).toBeDefined();
    user1Token = response.body.token;
  });

  test("can create a user", async (done) => {
    const user2 = {
      username: "testuser2",
      password: "testpassword2",
      address: {
        city: "Mombasa",
        street: "Nyali"
      }
    }
    const response = await supertest(app)
      .post("/api/signup/")
      .send(user2);
    expect(response.status).toEqual(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.message).toEqual("success");
    user2Token = response.body.token;
    done();
  });

  test("can create a post", async (done) => {
    const post = {
      author: "notnecessary",
      title: "a new test post",
      content: "content of the post"
    }
    const response = await supertest(app)
      .post("/api/posts/")
      .set("Authorization", `Bearer ${user1Token}`)
      .send(post);
    expect(response.status).toEqual(201);
    expect(response.body.title).toEqual(post.title);
    expect(response.body.content).toEqual(post.content);
    // test that only one post is in the database
    const postsInDB = await supertest(app).get("/api/posts/");
    expect(postsInDB.body.length).toEqual(1);
    done();
  });

  test("an existing api route", async (done) => {
    const response = await supertest(app).get("/");
    expect(response.status).toEqual(302);
    done();
  });

  test("a non existing route", async (done) => {
    const response = await supertest(app).get("/fakeroute");
    expect(response.status).toEqual(404);
    done();
  });

  afterAll(async () => {
    try {
      // drop database
      // await db.connection.db.dropDatabase()
      await database.db.dropDatabase()
      // close server
      await server.close(config.PORT);
    } catch (error) {
      console.info(`Failed to drop database or close\nError>>> \n ${error}`)
    }
  });
});
