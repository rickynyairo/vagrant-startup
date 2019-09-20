import { Request, Response } from "express";
import passport from "passport";
import { PostController, ReportController } from "./controllers";
import UserController from "../auth/controllers";

import {
  UserValidator,
  PostValidator,
  ModifyPostValidator,
  LoginValidator
} from "../utils/validators";
import { validationMiddleware } from "../middleware/common";

const {
  getAllPosts,
  createAPost,
  getPostById,
  deletePost,
  modifyPost
} = new PostController();

const { getAllPostsOfUser } = new UserController();

const { generateReport } = new ReportController();

export default [
  {
    path: "/api/posts",
    method: "get",
    handler: getAllPosts
  },
  {
    path: "/api/posts",
    method: "post",
    handler: [
      passport.authenticate("jwt", { session: false }),
      validationMiddleware(PostValidator),
      createAPost
    ]
  },
  {
    path: "/api/posts/:id",
    method: "get",
    handler: getPostById
  },
  {
    path: "/api/posts/:id",
    method: "delete",
    handler: [passport.authenticate("jwt", { session: false }), deletePost]
  },
  {
    path: "/api/posts/:id",
    method: "put",
    handler: [
      passport.authenticate("jwt", { session: false }),
      validationMiddleware(ModifyPostValidator),
      modifyPost
    ]
  },
  {
    path: "/api/users/:id/posts",
    method: "get",
    handler: [
      passport.authenticate("jwt", { session: false }),
      getAllPostsOfUser
    ]
  },
  {
    path: "/api/report",
    method: "get",
    handler: [passport.authenticate("jwt", { session: false }), generateReport]
  }
];
