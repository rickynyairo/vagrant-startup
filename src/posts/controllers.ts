import { Request, Response, NextFunction } from "express";
import { userModel } from "../auth/models";
import { postModel } from "./models";
import { Post } from "./interfaces";

export class PostController {
  posts!: any;
  constructor() {
    this.posts = postModel;
  }
  /**
  * @swagger
  * /posts:
  *   get:
  *     summary: List all the posts
  *     description: Returns a list of all the posts
  *     tags:
  *       - posts
  *     responses:
  *       200:
  *         description: List of posts
  *         schema:
  *           type: list
  */
  getAllPosts = async (_request: Request, response: Response) => {
    const posts = await this.posts
      .find()
      .populate("author", "username")
      .exec();
    return response.status(200).send(posts);
  };

  getPostById = async (request: Request, response: Response) => {
    const { id } = request.params;
    const post = await this.posts.findById(id).exec();
    return response.status(200).send(post);
  };

  modifyPost = async (request: Request, response: Response) => {
    const { id } = request.params;
    const postData: Post = request.body;
    this.posts
      .findByIdAndUpdate(id, postData, { new: true })
      .then((post: any) => response.send(post));
  };
  /**
 * @swagger
 * /add:
 *   post:
 *     summary: Create a post
 *     description: Add a post to the db
 *     tags:
 *       - posts
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       201:
 *         description: Adds the post in db
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             title:
 *               type: string
 *             content:
 *               type: string
 *
 */
  createAPost = async (request: Request, response: Response) => {
    const post: Post = request.body;
    const createdPost = new postModel({
      ...post,
      author: request.user._id
    });
    const savedPost = await createdPost.save();
    await savedPost.populate("author", "username").execPopulate();
    return response.status(201).send(savedPost);
  };

  deletePost = (request: Request, response: Response) => {
    const { id } = request.params;
    this.posts.findByIdAndDelete(id).then((successResponse: any) => {
      return successResponse ? response.send(200) : response.send(404);
    });
  };
}


export class ReportController {
  user!: any;
  constructor() {
    this.user = userModel;
  }
  generateReport = async (
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    const usersByCities = await this.user.aggregate([
      {
        $match: {
          "address.city": {
            $exists: true,
          },
        },
      },
      {
        $group: {
          _id: {
            city: "$address.city"
          },
          users: {
            $push: {
              username: "$username",
              _id: "$_id"
            }
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $lookup: {
          from: "posts",
          localField: "users._id",
          foreignField: "author",
          as: "articles",
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "users._id",
          foreignField: "_id",
          as: "users",
        }
      },
      {
        $addFields: {
          amountOfArticles: {
            $size: "$articles"
          },
        },
      },
      {
        $sort: {
          amountOfArticles: -1,
        },
      }
    ]);
    return response.send({
      usersByCities
    });
  };
}

