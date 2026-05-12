import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Security headers: X-Content-Type-Options, X-Frame-Options, HSTS, etc.
// contentSecurityPolicy is disabled here because the frontend is served from a
// separate Vite origin during development; the Vite build handles its own CSP.
app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  pinoHttp({
    logger,
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

// CORS: wide-open for the MVP — frontend and API share the same Replit proxy
// and there are no user accounts or sensitive data exposed to the frontend.
app.use(cors());

// Limit request body size to prevent large payload abuse.
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Global rate limit: 60 requests per 15 minutes per IP.
// Acts as a flood / DDoS backstop across all endpoints.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again in a few minutes." },
  }),
);

app.use("/api", router);

export default app;
