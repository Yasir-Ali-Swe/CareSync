import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI, {
    autoIndex: !env.NODE_ENV || env.NODE_ENV !== "production",
  });
  console.log("MongoDB connected");
};
