import { model, Schema, Document } from "mongoose";
import { Post } from "./interfaces";

const postSchema = new Schema({
  author: {
    ref: "User",
    type: Schema.Types.ObjectId
  },
  content: String,
  title: String
});

export const postModel = model<Post & Document>("Post", postSchema);
