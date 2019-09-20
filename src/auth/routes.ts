import { Request, Response } from "express";
import passport from "passport";
import UserController from "./controllers";

import {
  UserValidator,
  LoginValidator
} from "../utils/validators";

import { validationMiddleware } from "../middleware/common";

const { registerUser, loginUser, getAllUsers } = new UserController();


export default [
  {
    path: "/",
    method: "get",
    handler: async (_req: Request, res: Response) => {
      // redirect user to the api docs
      res.redirect("/api-docs");
    }
  },
  {
    path: "/api/signup",
    method: "post",
    handler: [validationMiddleware(UserValidator), registerUser]
  },
  {
    path: "/api/login",
    method: "post",
    handler: [
      validationMiddleware(LoginValidator),
      passport.authenticate("login"),
      loginUser
    ]
  },
  {
    path: "/api/users",
    method: "get",
    handler: getAllUsers
  }
];
