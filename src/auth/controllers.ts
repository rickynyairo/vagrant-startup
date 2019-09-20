import { Request, Response, NextFunction } from "express";
import { Document } from "mongoose";
import { userModel, createUser, toAuthJSON } from "./models";
import { postModel } from "../posts/models";
import { User } from "./interfaces";

export default class UserController {
  users!: any;
  constructor() {
    this.users = userModel;
  }

  loginUser = async (
    request: Request,
    response: Response,
  ) => {
    const { username, id } = request.user;
    return response
      .status(200)
      .send({ message: "success", ...toAuthJSON({ username, id }) });
  };

  registerUser = async (request: Request, response: Response) => {
    const newUser: User & Document = new userModel(request.body);
    if (await userModel.findOne({ username: newUser.username })) {
      return response
        .status(400)
        .send({ message: "A user with that username exists" });
    }
    await createUser(newUser, (error: any, savedUser: any) => {
      if (error) throw error;
      return response
        .status(201)
        .send({
          message: "success",
          ...toAuthJSON({
            username: savedUser.username,
            id: savedUser.id
          })
        })
        .end();
    });
  };
  getAllPostsOfUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const userIdParam = request.params.id;
      const posts = await postModel.find({ author: userIdParam });
      return response.send(posts);
    } catch (error) {
      next(error);
    }
  };
  getAllUsers = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const users = await userModel.find()
      return response.send({ number: users.length, users });
    } catch (error) {
      next(error);
    }
  };
}
