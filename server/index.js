import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
