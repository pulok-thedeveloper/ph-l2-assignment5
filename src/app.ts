import express, { Request, Response } from "express";
import expressSession from "express-session";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import { envVars } from "./app/config/env";
import passport from "passport";
import "./app/config/passport";

const app = express();
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173", // dev
  "https://ride-sharing-app-frontend-orcin.vercel.app", // production
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Ride Sharing App Backend",
  });
});

app.use(globalErrorHandler);

app.use(notFound);


export default app;
