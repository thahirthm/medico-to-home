import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { ZodError } from "zod";
import { audit } from "./auth";
import { pool } from "./db";
import { env } from "./env";
import { ApiError } from "./errors";
import { accountRoutes } from "./modules/account";
import { adminRoutes } from "./modules/admin";
import { bookingRoutes } from "./modules/bookings";
import { callRoutes } from "./modules/calls";
import { catalogueRoutes } from "./modules/catalogue";
import { medicoRoutes } from "./modules/medico";
import { proRoutes } from "./modules/pro";

export async function buildApp() {
  // Behind Nginx in production: trust its X-Forwarded-For so rate limits see the real visitor.
  const app = Fastify({ logger: { level: "warn" }, trustProxy: true });
  // WEB_ORIGIN may list several sites, comma separated (main site, www, admin address).
  await app.register(cors, { origin: env.WEB_ORIGIN.split(",").map((o) => o.trim()), methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] });

  await app.register(rateLimit, { global: false });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) return reply.code(error.statusCode).send({ message: error.message });
    if ((error as { statusCode?: number }).statusCode === 429) return reply.code(429).send({ message: "Too many attempts. Please wait a minute and try again." });
    if (error instanceof ZodError) {
      // Our own messages read well; zod's built-in ones ("Too small: expected string…") do not, so name the field instead.
      const issue = error.issues[0];
      const own = issue && !/^(Too small|Too big|Invalid|Expected|Required)/i.test(issue.message);
      const field = String(issue?.path.at(-1) ?? "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
      request.log.warn({ issue }, "validation failed");
      return reply.code(400).send({ message: own ? issue.message : field ? `Please check the ${field}.` : "Please check the details." });
    }
    if ((error as { code?: string }).code === "23505") return reply.code(409).send({ message: "That already exists." });
    if ((error as { code?: string }).code === "23503") return reply.code(409).send({ message: "This is still in use, so it cannot be removed." });
    request.log.error(error);
    return reply.code(500).send({ message: "Something went wrong. Please try again." });
  });

  // Every change made in the admin dashboard is written to the audit log.
  app.addHook("onResponse", async (request, reply) => {
    if (!request.actor || request.method === "GET" || reply.statusCode >= 400 || !request.url.startsWith("/admin/")) return;
    const body = request.body && typeof request.body === "object" ? { ...(request.body as Record<string, unknown>) } : {};
    delete body.password;
    await audit(request.actor, `${request.method} ${request.routeOptions.url ?? request.url}`, `${request.url} ${JSON.stringify(body)}`.slice(0, 2000)).catch((error) => request.log.error(error));
  });

  app.get("/health", async (_request, reply) => {
    try {
      await pool.query("select 1");
      return { status: "ok", database: "connected" };
    } catch (error) {
      app.log.error(error);
      return reply.code(503).send({ status: "error", database: "unreachable" });
    }
  });

  await app.register(catalogueRoutes);
  await app.register(accountRoutes);
  await app.register(bookingRoutes);
  await app.register(callRoutes);
  await app.register(proRoutes);
  await app.register(medicoRoutes);
  await app.register(adminRoutes);
  return app;
}
