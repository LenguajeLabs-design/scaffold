import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const allowedOrigins = (process.env["CORS_ALLOWED_ORIGINS"] ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Render terminates TLS at one reverse proxy. This must stay explicit: trusting
// arbitrary forwarded headers lets callers choose their own apparent IP.
const trustedProxyHops = Number(process.env.TRUST_PROXY ?? "0");
if (!Number.isInteger(trustedProxyHops) || trustedProxyHops < 0 || trustedProxyHops > 2) {
  throw new Error("TRUST_PROXY must be an integer from 0 to 2");
}
app.set("trust proxy", trustedProxyHops);

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

// Keep local development easy while allowing production to restrict requests
// to approved frontend origins such as GitHub Pages.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== "production" && allowedOrigins.length === 0)) {
        callback(null, true);
        return;
      }

      logger.warn({ origin }, "Blocked request from disallowed CORS origin");
      callback(new Error("Origin not allowed by CORS"));
    },
  }),
);

// Limit request body size to prevent large payload abuse.
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Global rate limit: 60 requests per 15 minutes per IP.
// Acts as a flood / DDoS backstop across all endpoints.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    skip: (req) => req.path === "/api/healthz",
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again in a few minutes." },
  }),
);

app.use("/api", router);

app.use((_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ error: "The request could not be processed." });
});

export default app;
