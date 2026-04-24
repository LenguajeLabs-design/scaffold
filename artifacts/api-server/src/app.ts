import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    // Strip down logged request/response objects to avoid accidentally logging
    // user input or sensitive headers at high volume.
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// CORS: wide-open for the MVP because the frontend and API are served through
// the same Replit proxy and there are no user accounts or sensitive data.
// When moving to production with a real domain, restrict this to that origin.
app.use(cors());

// Limit request body size to prevent large payload abuse.
// AI prompts are short — 16 kb is generous for any expected input.
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api", router);

export default app;
